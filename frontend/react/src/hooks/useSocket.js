import { useRef, useEffect, useState } from "react";
import { getApiBase } from "../utils/api";

export const useSocket = (isHost, isApproved, onFileUploaded, onFileDeleted) => {
  const socketRef = useRef(null);
  const [autoRequested, setAutoRequested] = useState(false);

  const initSocket = async () => {
    try {
      if (socketRef.current && socketRef.current.connected)
        return socketRef.current;
      
      const API_BASE = getApiBase();
      const { io } = await import("socket.io-client");
      const s = io(API_BASE);

      s.on("connect", () => {
        console.debug("socket connected", s.id);
        // auto-request connection when opening host IP
        if (!isHost && !autoRequested) {
          try {
            s.emit("request_connect", { name: null });
            setAutoRequested(true);
          } catch (e) {
            console.warn("auto request failed", e);
          }
        }
      });

      s.on("file_uploaded", (data) => {
        if (!isHost && !isApproved) return;
        if (!data || !data.filename) return;
        onFileUploaded(data);
      });

      s.on("file_deleted", (d) => {
        if (!d || !d.filename) return;
        onFileDeleted(d.filename);
      });

      socketRef.current = s;
      return s;
    } catch (e) {
      console.warn("initSocket failed", e);
      return null;
    }
  };

  const startServer = async () => {
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit("become_host", { name: `WifiX-host` });
        return { success: true };
      } catch (e) {
        console.warn("failed to emit become_host on existing socket", e);
        return { success: false };
      }
    }

    const API_BASE = getApiBase();
    try {
      const { io } = await import("socket.io-client");
      const s = io(API_BASE, { autoConnect: false });

      s.on("connect", () => {
        console.log("Socket connected", s.id);
      });

      s.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      s.connect();

      const hostName = `WifiX-${Math.random().toString(36).slice(2, 8)}`;
      s.emit("become_host", { name: hostName });

      socketRef.current = s;
      return { success: true };
    } catch (err) {
      console.error("Failed to start server (socket connect):", err);
      return { success: false, error: err.message };
    }
  };

  const stopServer = async () => {
    try {
      const s = socketRef.current;
      if (s && s.connected) {
        try {
          s.emit("stop_host", {});
        } catch (e) {
          console.warn("emit stop_host failed", e);
        }
        try {
          s.disconnect();
        } catch (e) {}
      }
    } catch (e) {
      console.warn("stopServer error", e);
    } finally {
      socketRef.current = null;
    }
  };

  const connectToHost = async (displayName = "Guest") => {
    try {
      const s = socketRef.current || (await initSocket());
      if (!s) {
        return { success: false, message: "Socket unavailable" };
      }
      if (autoRequested) {
        return {
          success: false,
          message: "Connection request already sent. Waiting for host approval...",
        };
      }
      s.emit("request_connect", { name: displayName });
      setAutoRequested(true);
      return { success: true };
    } catch (e) {
      console.warn("connectToHost", e);
      return { success: false, error: e.message };
    }
  };

  const setupSocketHandlers = (handlers) => {
    const s = socketRef.current;
    if (!s) return;

    if (handlers.onRequestApproved) {
      s.on("request_approved", handlers.onRequestApproved);
    }
    if (handlers.onRequestDenied) {
      s.on("request_denied", handlers.onRequestDenied);
    }
    if (handlers.onIncomingRequest) {
      s.on("incoming_request", handlers.onIncomingRequest);
    }
    if (handlers.onHostStatus) {
      s.on("host_status", handlers.onHostStatus);
    }
  };

  useEffect(() => {
    return () => {
      try {
        if (socketRef.current) socketRef.current.disconnect();
      } catch (e) {}
    };
  }, []);

  return {
    socketRef,
    initSocket,
    startServer,
    stopServer,
    connectToHost,
    setupSocketHandlers,
    autoRequested,
  };
};
