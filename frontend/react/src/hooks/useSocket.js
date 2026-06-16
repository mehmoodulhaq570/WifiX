import { useRef, useEffect, useState } from "react";
import { getApiBase } from "../utils/api";

export const useSocket = (
  isHost,
  isApproved,
  onFileUploaded,
  onFileDeleted
) => {
  const socketRef = useRef(null);
  const requestSentRef = useRef(false);

  const getSocketTransports = () => {
    const configured = import.meta.env.VITE_SOCKET_TRANSPORTS;
    if (configured) {
      return configured
        .split(",")
        .map((transport) => transport.trim())
        .filter(Boolean);
    }

    // Waitress on Windows is a WSGI server and cannot expose the raw socket
    // needed for WebSocket upgrades. Polling works on Waitress and remains
    // compatible with Gunicorn deployments.
    return ["polling"];
  };

  const initSocket = async () => {
    try {
      if (socketRef.current && socketRef.current.connected) {
        console.log("Socket already connected:", socketRef.current.id);
        return socketRef.current;
      }

      const API_BASE = getApiBase();
      console.log("Initializing socket connection to:", API_BASE);
      const { io } = await import("socket.io-client");
      const s = io(API_BASE, {
        transports: getSocketTransports(),
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      s.on("connect", () => {
        console.log("✅ Socket connected successfully! Socket ID:", s.id);
      });

      s.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
      });

      s.on("disconnect", (reason) => {
        console.log("Socket disconnected. Reason:", reason);
        requestSentRef.current = false;
      });

      s.on("file_uploaded", (data) => {
        // Allow ALL users to see file uploads in real-time
        if (!data || !data.filename) return;
        console.log("file_uploaded event received:", data);
        onFileUploaded(data);
      });

      s.on("file_deleted", (d) => {
        // Allow ALL users to see file deletions in real-time
        if (!d || !d.filename) return;
        console.log("file_deleted event received:", d);
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
    console.log("🏠 startServer called");
    if (socketRef.current && socketRef.current.connected) {
      try {
        console.log("📤 Emitting become_host on existing socket");
        socketRef.current.emit("become_host", { name: `WifiX-host` });
        return { success: true };
      } catch (e) {
        console.error("❌ Failed to emit become_host:", e);
        return { success: false };
      }
    }

    console.log("Creating new socket for host");
    const API_BASE = getApiBase();
    try {
      const { io } = await import("socket.io-client");
      const s = io(API_BASE, {
        autoConnect: true,
        transports: getSocketTransports(),
      });

      s.on("connect", () => {
        console.log("✅ Host socket connected! Socket ID:", s.id);
        console.log("📤 Emitting become_host");
        s.emit("become_host", { name: `WifiX-host` });
      });

      s.on("disconnect", () => {
        console.log("Host socket disconnected");
      });

      // Setup file event listeners for the new socket
      s.on("file_uploaded", (data) => {
        if (!data || !data.filename) return;
        console.log("file_uploaded event received:", data);
        onFileUploaded(data);
      });

      s.on("file_deleted", (d) => {
        if (!d || !d.filename) return;
        console.log("file_deleted event received:", d);
        onFileDeleted(d.filename);
      });

      socketRef.current = s;
      return { success: true };
    } catch (err) {
      console.error("❌ Failed to start server (socket connect):", err);
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
      console.log("🔌 connectToHost called with displayName:", displayName);
      const s = socketRef.current || (await initSocket());
      if (!s) {
        console.error("❌ Socket unavailable");
        return { success: false, message: "Socket unavailable" };
      }

      if (!s.connected) {
        console.log("⏳ Socket not connected yet, waiting...");
        await new Promise((resolve) => {
          if (s.connected) {
            resolve();
          } else {
            s.once("connect", resolve);
            setTimeout(resolve, 5000); // timeout after 5s
          }
        });
      }

      if (!s.connected) {
        console.error("❌ Socket failed to connect within timeout");
        return { success: false, message: "Connection timeout" };
      }

      console.log("📤 Emitting request_connect event with name:", displayName);
      s.emit("request_connect", { name: displayName });
      requestSentRef.current = true;
      console.log("✅ Connection request sent successfully");
      return { success: true };
    } catch (e) {
      console.error("❌ connectToHost error:", e);
      return { success: false, error: e.message };
    }
  };

  const setupSocketHandlers = (handlers) => {
    const s = socketRef.current;
    if (!s) {
      console.warn("⚠️ Cannot setup handlers - socket not initialized");
      return;
    }

    console.log("🔧 Setting up socket event handlers");

    // Remove old listeners to prevent duplicates
    s.off("request_approved");
    s.off("request_denied");
    s.off("incoming_request");
    s.off("host_status");

    if (handlers.onRequestApproved) {
      s.on("request_approved", (data) => {
        console.log("✅ Received request_approved event:", data);
        handlers.onRequestApproved(data);
      });
    }
    if (handlers.onRequestDenied) {
      s.on("request_denied", (data) => {
        console.log("❌ Received request_denied event:", data);
        handlers.onRequestDenied(data);
      });
    }
    if (handlers.onIncomingRequest) {
      s.on("incoming_request", (data) => {
        console.log("📥 Received incoming_request event:", data);
        handlers.onIncomingRequest(data);
      });
    }
    if (handlers.onHostStatus) {
      s.on("host_status", (st) => {
        console.log("📊 Received host_status event:", st);
        handlers.onHostStatus(st);
        // If host is not available, disconnect
        if (st && st.available === false) {
          console.log("Host is not available - disconnecting");
          if (handlers.onHostDisconnected) {
            handlers.onHostDisconnected({ reason: "host_unavailable" });
          }
        }
      });
    }

    console.log("✅ Socket event handlers setup complete");
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
  };
};
