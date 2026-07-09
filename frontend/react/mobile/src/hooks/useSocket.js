import { useEffect, useRef } from "react";
import {
  getApiBase,
  isHttpOnlyBackend,
  isMobileTauri,
  requestHostConnection,
} from "../utils/api";

export const useSocket = (
  isHost,
  isApproved,
  onFileUploaded,
  onFileDeleted
) => {
  const socketRef = useRef(null);
  const isHostRef = useRef(isHost);
  const requestSentRef = useRef(false);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  const getSocketTransports = () => {
    const configured = import.meta.env.VITE_SOCKET_TRANSPORTS;
    if (configured) {
      return configured
        .split(",")
        .map((transport) => transport.trim())
        .filter(Boolean);
    }

    // Waitress on Windows is WSGI-only and cannot handle WebSocket upgrades.
    return ["polling"];
  };

  const waitForConnect = (socket, timeoutMs = 15000) => {
    if (socket.connected) return Promise.resolve(true);

    return new Promise((resolve) => {
      let settled = false;
      let timer;

      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
        resolve(ok);
      };

      const onConnect = () => finish(true);
      const onError = () => finish(false);

      timer = setTimeout(() => finish(false), timeoutMs);
      socket.once("connect", onConnect);
      socket.once("connect_error", onError);
      socket.connect();
    });
  };

  const emitWithAck = (socket, event, payload, timeoutMs = 10000) => {
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ ok: false, reason: "ack_timeout" });
      }, timeoutMs);

      socket.emit(event, payload, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(response || { ok: true });
      });
    });
  };

  const attachBaseHandlers = (socket) => {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("disconnect");
    socket.off("file_uploaded");
    socket.off("file_deleted");

    socket.on("connect", async () => {
      console.log("Socket connected:", socket.id);
      if (isHostRef.current) {
        const ack = await emitWithAck(socket, "become_host", {
          name: "WifiX-host",
        });
        if (!ack.ok) {
          console.warn("Host re-registration failed:", ack);
        }
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      requestSentRef.current = false;
    });

    socket.on("file_uploaded", (data) => {
      if (!data || !data.filename) return;
      onFileUploaded(data);
    });

    socket.on("file_deleted", (data) => {
      if (!data || !data.filename) return;
      onFileDeleted(data.filename);
    });
  };

  const createSocket = async () => {
    if (await isHttpOnlyBackend()) {
      return null;
    }

    const { io } = await import("socket.io-client");
    const socket = io(getApiBase(), {
      autoConnect: false,
      transports: getSocketTransports(),
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 8,
      timeout: 15000,
    });

    attachBaseHandlers(socket);
    socketRef.current = socket;
    return socket;
  };

  const initSocket = async () => {
    try {
      if (await isHttpOnlyBackend()) {
        return null;
      }

      const socket = socketRef.current || (await createSocket());
      await waitForConnect(socket);
      return socket;
    } catch (error) {
      console.warn("initSocket failed", error);
      return null;
    }
  };

  const startServer = async () => {
    try {
      if (await isHttpOnlyBackend()) {
        return { success: true };
      }

      const socket = socketRef.current || (await createSocket());
      const connected = await waitForConnect(socket);
      if (!connected) {
        return { success: false, message: "Socket connection timeout" };
      }

      const ack = await emitWithAck(socket, "become_host", {
        name: "WifiX-host",
      });
      if (!ack.ok) {
        return {
          success: false,
          message: "Backend did not confirm host registration",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to start host socket:", error);
      return { success: false, message: error.message };
    }
  };

  const stopServer = async () => {
    try {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit("stop_host", {});
        socket.disconnect();
      }
    } catch (error) {
      console.warn("stopServer error", error);
    } finally {
      socketRef.current = null;
      requestSentRef.current = false;
    }
  };

  const connectToHost = async (displayName = "Guest") => {
    try {
      if (await isHttpOnlyBackend()) {
        try {
          const ack = await requestHostConnection({ name: displayName });
          requestSentRef.current = true;
          return { success: true, requestId: ack.request_id };
        } catch (error) {
          return { success: false, message: error.message };
        }
      }

      const socket = socketRef.current || (await createSocket());
      const connected = await waitForConnect(socket);
      if (!connected) {
        try {
          const ack = await requestHostConnection({ name: displayName });
          requestSentRef.current = true;
          return { success: true, requestId: ack.request_id };
        } catch (error) {
          return { success: false, message: "Connection timeout" };
        }
      }

      let ack = await emitWithAck(socket, "request_connect", {
        name: displayName,
      });

      if (!ack.ok && ack.reason === "ack_timeout") {
        try {
          ack = await requestHostConnection({ sid: socket.id, name: displayName });
        } catch (error) {
          return { success: false, message: error.message };
        }
      }

      if (!ack.ok) {
        if (ack.reason === "no_host") {
          return {
            success: false,
            message:
              "No host is available. Click Become Host on the host device first.",
          };
        }
        if (ack.reason === "ack_timeout") {
          return {
            success: false,
            message:
              "Connection request timed out. Try again after the host is fully started.",
          };
        }
        return {
          success: false,
          message: ack.message || "Host did not receive the request",
        };
      }

      requestSentRef.current = true;
      return { success: true, requestId: ack.request_id };
    } catch (error) {
      console.error("connectToHost error:", error);
      return { success: false, message: error.message };
    }
  };

  const setupSocketHandlers = (handlers) => {
    if (isMobileTauri()) {
      return;
    }

    const socket = socketRef.current;
    if (!socket) {
      console.warn("Cannot setup handlers - socket is not initialized");
      return;
    }

    socket.off("request_approved");
    socket.off("request_denied");
    socket.off("incoming_request");
    socket.off("host_status");

    if (handlers.onRequestApproved) {
      socket.on("request_approved", handlers.onRequestApproved);
    }

    if (handlers.onRequestDenied) {
      socket.on("request_denied", handlers.onRequestDenied);
    }

    if (handlers.onIncomingRequest) {
      socket.on("incoming_request", handlers.onIncomingRequest);
    }

    if (handlers.onHostStatus) {
      socket.on("host_status", (status) => {
        handlers.onHostStatus(status);
        if (status && status.available === false && handlers.onHostDisconnected) {
          handlers.onHostDisconnected({ reason: "host_unavailable" });
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      try {
        if (socketRef.current) socketRef.current.disconnect();
      } catch (error) {
        console.warn("socket cleanup failed", error);
      }
    };
  }, []);

  return {
    socketRef,
    initSocket,
    startServer,
    stopServer,
    connectToHost,
    setupSocketHandlers,
  };
};
