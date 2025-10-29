import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    ip: "192.168.1.5",
    host_url: null,
    lan_url: null,
  });
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const [isHost, setIsHost] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [statusMsg, setStatusMsg] = useState("No uploads yet.");
  const [qrUrl, setQrUrl] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [autoRequested, setAutoRequested] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // helper: backend API base
  const getApiBase = () => {
    try {
      return (
        (typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.VITE_API_URL) ||
        window.location.origin
      );
    } catch (e) {
      return window.location.origin;
    }
  };

  // Start the server (become host) - connects to backend Socket.IO and emits become_host
  const startServer = async () => {
    // If there's an existing socket, ensure we register this socket as the host
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit("become_host", { name: `WifiX-host` });
        setIsHost(true);
      } catch (e) {
        console.warn("failed to emit become_host on existing socket", e);
      }
      return;
    }

    const API_BASE = getApiBase();

    try {
      const { io } = await import("socket.io-client");
      const s = io(API_BASE, { autoConnect: false });

      s.on("connect", () => {
        console.log("Socket connected", s.id);
        setIsHost(true);
      });

      s.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsHost(false);
      });

      s.connect();

      // Emit become_host so the backend registers this socket as a host
      const hostName = `WifiX-${Math.random().toString(36).slice(2, 8)}`;
      s.emit("become_host", { name: hostName });

      // refresh device info from backend so LAN address is accurate when hosting
      try {
        const infoRes = await fetch(`${getApiBase().replace(/\/$/, "")}/info`);
        if (infoRes.ok) {
          const info = await infoRes.json();
          setDeviceInfo((d) => ({ ...d, ...info }));
        }
      } catch (e) {
        console.warn("failed to fetch /info after become_host", e);
      }

      socketRef.current = s;
      setIsHost(true);
    } catch (err) {
      console.error("Failed to start server (socket connect):", err);
      alert(
        "Unable to connect to backend Socket.IO. Make sure the backend is running and reachable."
      );
    }
  };

  // Stop hosting: inform backend and disconnect local socket
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
      setIsHost(false);
      setStatusMsg("Hosting stopped");
    }
  };

  // Initialize Socket.IO and attach handlers (used by both host & client flows)
  const initSocket = async () => {
    try {
      if (socketRef.current && socketRef.current.connected)
        return socketRef.current;
      const API_BASE =
        (typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.VITE_API_URL) ||
        window.location.origin;
      const { io } = await import("socket.io-client");
      const s = io(API_BASE);

      s.on("connect", () => {
        console.debug("socket connected", s.id);
        // auto-request connection when opening host IP (matches template behavior)
        if (!isHost && !autoRequested) {
          try {
            s.emit("request_connect", { name: null });
            setAutoRequested(true);
            setStatusMsg("Requesting connection to host...");
          } catch (e) {
            console.warn("auto request failed", e);
          }
        }
      });

      s.on("file_uploaded", (data) => {
        // only show files to approved clients or the host
        if (!isHost && !isApproved) return;
        if (!data || !data.filename) return;
        setFiles((prev) => {
          // avoid duplicates
          if (prev.find((p) => p.name === data.filename)) return prev;
          return [
            {
              name: data.filename,
              url: data.url || null,
              size: data.size || 0,
              mtime: Date.now(),
              type: data.type || "file",
            },
            ...prev,
          ];
        });
      });

      s.on("file_deleted", (d) => {
        if (!d || !d.filename) return;
        setFiles((prev) => prev.filter((f) => f.name !== d.filename));
      });

      s.on("request_approved", (d) => {
        setIsApproved(true);
        setStatusMsg("Connected to host.");
        // load files now that we're approved
        loadFiles();
      });

      s.on("request_denied", (d) => {
        setStatusMsg("Connection denied by host.");
      });

      s.on("incoming_request", (data) => {
        // show a simple prompt to the host to approve/deny
        const name = data?.name || "Guest";
        const sid = data?.sid;
        const ok = window.confirm(`${name} wants to connect. Allow?`);
        if (ok) s.emit("approve_request", { sid });
        else s.emit("deny_request", { sid });
      });

      // host status updates
      s.on("host_status", (st) => {
        if (st && st.available === false)
          setStatusMsg("Host is not available.");
      });

      socketRef.current = s;
      return s;
    } catch (e) {
      console.warn("initSocket failed", e);
      return null;
    }
  };

  // Fetch files from backend and set state
  const loadFiles = async () => {
    try {
      const res = await fetch(`${getApiBase().replace(/\/$/, "")}/files`);
      if (!res.ok) throw new Error("fetch files failed");
      const items = await res.json();
      // normalize into local file shape
      const normalized = (items || []).map((it) => ({
        name: it.filename || it.name,
        url: it.url || null,
        size: it.size || 0,
        mtime: it.mtime ? it.mtime * 1000 : Date.now(),
        type: it.type || "file",
      }));
      setFiles(normalized);
    } catch (e) {
      console.warn("loadFiles", e);
    }
  };

  // Ensure auth (PIN) then initialize socket
  const ensureAuthThenInit = async () => {
    try {
      // fetch server info for UI (host and LAN URLs)
      try {
        const infoRes = await fetch(`${getApiBase().replace(/\/$/, "")}/info`);
        if (infoRes.ok) {
          const info = await infoRes.json();
          setDeviceInfo((d) => ({ ...d, ...info }));
        }
      } catch (e) {
        console.warn("fetch /info failed", e);
      }

      const res = await fetch(`${getApiBase().replace(/\/$/, "")}/auth/status`);
      if (!res.ok) {
        await initSocket();
        return;
      }
      const st = await res.json();
      if (st.pin_required && !st.authed) {
        const pin = window.prompt("Enter access PIN:") || "";
        const r = await fetch(`${getApiBase().replace(/\/$/, "")}/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        if (!r.ok) {
          setStatusMsg("Invalid PIN");
          return;
        }
      }
      await initSocket();
    } catch (e) {
      console.warn("ensureAuthThenInit", e);
      await initSocket();
    }
  };

  // Upload selected files to backend (uses XHR to get progress)
  const handleUpload = async () => {
    const inputEl = fileInputRef.current;
    const file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) {
      setStatusMsg("Please select a file first.");
      return;
    }
    setStatusMsg(`Uploading ${file.name}...`);
    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const apiBase = getApiBase().replace(/\/$/, "");
        xhr.open("POST", `${apiBase}/upload`, true);
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setStatusMsg(`Uploading ${file.name}: ${pct}%`);
          }
        };
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              const savedName = json.filename || json.name || null;
              const url = json.url || json.data?.url || null;
              if (savedName) {
                // add to UI file list immediately (host and clients will also get socket updates)
                setFiles((prev) => [
                  {
                    name: savedName,
                    url: url,
                    size: file.size || 0,
                    mtime: Date.now(),
                    type: file.type || "file",
                  },
                  ...prev,
                ]);
              }
              if (url) {
                setQrUrl(url);
                setStatusMsg(`Uploaded: ${url}`);
              } else {
                setStatusMsg("Upload succeeded but no URL returned.");
              }
            } catch (err) {
              setStatusMsg(
                "Upload completed but failed to parse server response."
              );
            }
            resolve();
          } else {
            setStatusMsg("Upload failed: " + xhr.statusText);
            reject(new Error("upload failed"));
          }
        };
        xhr.onerror = function () {
          setStatusMsg("Upload error.");
          reject(new Error("upload error"));
        };
        const fd = new FormData();
        fd.append("file", file);
        xhr.send(fd);
      });
    } catch (e) {
      console.warn("upload failed", e);
    }
  };

  // connect as client (request to host)
  const connectToHost = async () => {
    try {
      const s = socketRef.current || (await initSocket());
      if (!s) {
        setStatusMsg("Socket unavailable");
        return;
      }
      if (autoRequested) {
        setStatusMsg(
          "Connection request already sent. Waiting for host approval..."
        );
        return;
      }
      const displayName =
        window.prompt("Name to show to host (optional)") || "Guest";
      s.emit("request_connect", { name: displayName });
      setAutoRequested(true);
      setStatusMsg("Connection request sent. Waiting for host approval...");
    } catch (e) {
      console.warn("connectToHost", e);
    }
  };

  // cleanup socket on unmount
  useEffect(() => {
    ensureAuthThenInit();
    return () => {
      try {
        if (socketRef.current) socketRef.current.disconnect();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    const files = e.target?.files || e.dataTransfer?.files;
    if (files && files.length > 0) {
      // Update the file input ref to contain the selected files for drag-drop
      if (fileInputRef.current && e.dataTransfer?.files) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
    }
  };

  // Ask user to confirm delete (shows modal)
  const confirmDelete = (name) => {
    setDeleteTarget(name);
    setShowDeleteModal(true);
  };

  // Perform the confirmed delete (call backend then remove from UI)
  const handleDeleteConfirmed = async () => {
    const name = deleteTarget;
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (!name) return;
    try {
      const apiBase = getApiBase().replace(/\/$/, "");
      const res = await fetch(`${apiBase}/delete/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let msg = `Delete failed: ${res.status}`;
        try {
          const j = await res.json();
          if (j && j.error) msg = j.error;
        } catch (e) {}
        setStatusMsg(msg);
        return;
      }
      setFiles((prev) => prev.filter((f) => f.name !== name));
      setStatusMsg("File deleted");
    } catch (e) {
      console.warn("delete failed", e);
      setStatusMsg("Delete failed");
    }
  };

  return (
    <>
      {/* ---------- Header ---------- */}
      <header className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-8 text-center text-white shadow-lg rounded-b-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">WifiX Transfer</h1>
        <p className="opacity-90 text-sm md:text-base">
          Share your files wirelessly and securely
        </p>
      </header>

      {/* ---------- Main ---------- */}
      <main
        className={`transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        } font-sans py-12`}
      >
        {/* Centered container card to match screenshot */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 -mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ---------- Server Control (sidebar) ---------- */}
              <section className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
                <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2 w-full">
                  Server Control
                </h2>

                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    onClick={isHost ? stopServer : startServer}
                    className={`font-semibold px-6 py-2 rounded-md w-full sm:w-52 transition ${
                      isHost
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isHost ? "Stop Server" : "Start Server"}
                  </button>
                  <button
                    onClick={connectToHost}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md w-full sm:w-52 transition"
                  >
                    Connect to Host
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    <strong>LAN Address:</strong>{" "}
                    {deviceInfo.lan_ip || deviceInfo.ip}
                  </p>
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <div>
                      <QRCode
                        value={
                          deviceInfo.lan_url ||
                          deviceInfo.host_url ||
                          deviceInfo.ip
                        }
                        size={80}
                      />
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          // show QR for the device (or last uploaded file if present)
                          if (!qrUrl)
                            setQrUrl(
                              deviceInfo.lan_url ||
                                deviceInfo.host_url ||
                                deviceInfo.ip
                            );
                          setQrVisible((v) => !v);
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition"
                      >
                        {qrVisible ? "Hide QR" : "Show QR"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- Upload Files (main area) ---------- */}
              <section className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col">
                <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                  Upload Files
                </h2>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl flex-1 flex items-center justify-center p-10 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-base sm:text-lg">
                    Drag & drop files here or{" "}
                    <span className="text-blue-600 font-semibold">
                      click to select
                    </span>
                  </p>
                </div>

                <div className="flex justify-center mt-6 gap-3">
                  <button
                    onClick={handleUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold transition w-full sm:w-auto"
                  >
                    Upload
                  </button>
                </div>
              </section>
            </div>

            {/* ---------- Available Files ---------- */}
            <section className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mt-8">
              <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                Available Files
              </h2>

              {/* status and QR area */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {statusMsg}
                </div>
                {qrUrl && qrVisible ? (
                  <div className="mt-3 flex justify-center">
                    <img
                      alt="qr"
                      src={`${getApiBase().replace(
                        /\/$/,
                        ""
                      )}/qr?url=${encodeURIComponent(qrUrl)}`}
                      className="w-40 h-40"
                    />
                  </div>
                ) : null}
              </div>

              {files.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm sm:text-base">
                    <thead>
                      <tr className="bg-blue-500 text-white text-left">
                        <th className="p-3">Name</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Last Modified</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr
                          key={file.name}
                          className="border-b hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        >
                          <td className="p-3">{file.name}</td>
                          <td className="p-3">
                            {(file.size / 1024).toFixed(2)} KB
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {new Date(file.mtime).toLocaleString()}
                          </td>
                          <td className="p-3">{file.type}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => confirmDelete(file.name)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm sm:text-base"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No files found in the shared folder.
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                Confirm delete
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete <strong>{deleteTarget}</strong>?
                This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  No
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------- Dark/Light Toggle ---------- */}
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full p-3 shadow hover:scale-105 transition text-xl"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* ---------- Footer ---------- */}
        <footer className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 py-6 text-center w-full">
          © 2025 WifiX Transfer — Share locally, fast & secure
        </footer>
      </main>
    </>
  );
}

export default App;
