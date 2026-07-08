import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

// Components
import Header from "./components/Header";
import ServerControl from "./components/ServerControl";
import FileUploadZone from "./components/FileUploadZone";
import FileList from "./components/FileList";
import DeleteModal from "./components/DeleteModal";
import Footer from "./components/Footer";
import ConnectionApprovalModal from "./components/ConnectionApprovalModal";
import ConnectionStatus from "./components/ConnectionStatus";
import UploadErrorModal from "./components/UploadErrorModal";
import SetPinModal from "./components/SetPinModal";

// Hooks
import { useSocket } from "./hooks/useSocket";
import { useFileUpload } from "./hooks/useFileUpload";
import { useAuth } from "./hooks/useAuth";

// Utils
import {
  fetchDeviceInfo,
  waitForDeviceInfo,
  fetchFiles,
  deleteFile,
  getApiBase,
  isMobileTauri,
  fetchPendingConnectionRequests,
  respondToConnectionRequest,
  fetchConnectionRequestStatus,
} from "./utils/api";

function App() {
  const [files, setFiles] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({
    ip: "192.168.1.5",
    host_url: null,
    lan_url: null,
  });
  const fileInputRef = useRef(null);
  const [isHost, setIsHost] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [statusMsg, setStatusMsg] = useState("No uploads yet.");
  const [qrUrl, setQrUrl] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showUploadError, setShowUploadError] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pinProtectionEnabled, setPinProtectionEnabled] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isConnectingClient, setIsConnectingClient] = useState(false);
  const [pendingClientRequestId, setPendingClientRequestId] = useState(null);

  // B: Track per-file upload progress and speed
  const [uploadingFiles, setUploadingFiles] = useState({}); // { filename: { progress: 0-100, speed: "123 KB/s", loaded: bytes, total: bytes } }

  // File upload hook
  const { uploadFile, uploadProgress, isUploading } = useFileUpload();

  // Socket hook callbacks
  const handleFileUploaded = (data) => {
    setFiles((prev) => {
      if (prev.find((p) => p.name === data.filename)) return prev;
      return [
        {
          name: data.filename,
          url: data.url || null,
          size: data.size || 0,
          mtime: Date.now(),
          type: data.type || "file",
          has_pin: data.has_pin || false,
        },
        ...prev,
      ];
    });
  };

  const handleFileDeleted = (filename) => {
    setFiles((prev) => prev.filter((f) => f.name !== filename));
  };

  // Socket hook
  const {
    socketRef,
    initSocket,
    startServer: socketStartServer,
    stopServer: socketStopServer,
    connectToHost: socketConnectToHost,
    setupSocketHandlers,
  } = useSocket(isHost, isApproved, handleFileUploaded, handleFileDeleted);

  // Load files from backend
  const loadFiles = async () => {
    const items = await fetchFiles();
    setFiles(items);
  };

  const getConnectionHandlers = () => ({
    onRequestApproved: () => {
      setPendingClientRequestId(null);
      setIsApproved(true);
      setStatusMsg("Connected to host.");
      loadFiles();
    },
    onRequestDenied: (data) => {
      setPendingClientRequestId(null);
      if (data?.reason === "no_host") {
        setStatusMsg("No host is available. Ask the host to click Become Host first.");
      } else {
        setStatusMsg("Connection denied by host.");
      }
    },
    onIncomingRequest: (data) => {
      setPendingRequest(data);
      setShowApprovalModal(true);
    },
    onHostStatus: (st) => {
      if (st && st.available === false) {
        setStatusMsg("Host is not available.");
      }
    },
    onHostDisconnected: (data) => {
      console.log("Host disconnected:", data);
      setIsApproved(false);
      setIsHost(false);
      setFiles([]);
      setStatusMsg("Host has disconnected. All connections lost.");
    },
  });

  // Auth initialization
  const handleAuthComplete = async () => {
    const info = await fetchDeviceInfo();
    if (info) {
      setDeviceInfo((d) => ({ ...d, ...info }));
    }
    await initSocket();

    // Setup socket event handlers
    setupSocketHandlers(getConnectionHandlers());
  };

  useAuth(handleAuthComplete);

  // Periodic file sync - check for new/deleted files every 3 seconds
  useEffect(() => {
    if (!isHost && !isApproved) return; // Only sync if connected

    const interval = setInterval(async () => {
      try {
        const serverFiles = await fetchFiles();
        const serverFileNames = new Set(serverFiles.map((f) => f.name));
        const currentFileNames = new Set(files.map((f) => f.name));

        // Check for new files on server
        const newFiles = serverFiles.filter(
          (f) => !currentFileNames.has(f.name)
        );
        if (newFiles.length > 0) {
          console.log(
            "Found new files on server:",
            newFiles.map((f) => f.name)
          );
          setFiles((prev) => [...newFiles, ...prev]);
        }

        // Check for deleted files on server
        const deletedFiles = files.filter((f) => !serverFileNames.has(f.name));
        if (deletedFiles.length > 0) {
          console.log(
            "Found deleted files on server:",
            deletedFiles.map((f) => f.name)
          );
          setFiles((prev) => prev.filter((f) => serverFileNames.has(f.name)));
        }
      } catch (e) {
        console.warn("File sync check failed:", e);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [isHost, isApproved, files]);

  useEffect(() => {
    if (!isHost || showApprovalModal) return;

    const interval = setInterval(async () => {
      try {
        const pending = await fetchPendingConnectionRequests();
        if (pending.length > 0) {
          setPendingRequest(pending[0]);
          setShowApprovalModal(true);
        }
      } catch (error) {
        console.warn("pending connection poll failed", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isHost, showApprovalModal]);

  useEffect(() => {
    if (!pendingClientRequestId || isApproved) return;

    const interval = setInterval(async () => {
      try {
        const result = await fetchConnectionRequestStatus(pendingClientRequestId);
        if (result.status === "approved") {
          setPendingClientRequestId(null);
          setIsApproved(true);
          setStatusMsg("Connected to host.");
          toast.success("Host approved your connection.");
          loadFiles();
        } else if (result.status === "denied") {
          setPendingClientRequestId(null);
          setStatusMsg("Connection denied by host.");
          toast.error("Connection denied by host.");
        }
      } catch (error) {
        console.warn("connection status poll failed", error);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [pendingClientRequestId, isApproved]);

  // Server control handlers
  const handleStartServer = async () => {
    setStatusMsg("Starting host...");
    const backendInfo = isMobileTauri()
      ? await waitForDeviceInfo()
      : await fetchDeviceInfo();
    if (!backendInfo) {
      const message = `Backend is not reachable at ${getApiBase()}. Start the backend and refresh the frontend.`;
      setStatusMsg(message);
      toast.error(message, { duration: 7000 });
      return;
    }

    const result = await socketStartServer();
    if (result.success) {
      setIsHost(true);
      setupSocketHandlers(getConnectionHandlers());
      setDeviceInfo((d) => ({ ...d, ...backendInfo }));
      // Load existing files when becoming host
      await loadFiles();
      setStatusMsg("Server started. Waiting for connections...");
      toast.success("Server started successfully!");
    } else {
      toast.error(
        result.message ||
          "Unable to connect to backend Socket.IO. Make sure the backend is running and reachable.",
        { duration: 6000 }
      );
    }
  };

  const handleStopServer = async () => {
    await socketStopServer();
    setIsHost(false);
    setStatusMsg("Hosting stopped");
  };

  const handleConnectToHost = async () => {
    setIsConnectingClient(true);
    setStatusMsg("Sending connection request to host...");

    try {
      if (!isMobileTauri()) {
        // Ensure socket is initialized and handlers are set up before connecting
        const socket = socketRef.current || (await initSocket());
        if (!socket) {
          setStatusMsg("Failed to initialize socket connection");
          toast.error("Could not initialize client connection.");
          return;
        }

        // Setup handlers if not already done
        setupSocketHandlers(getConnectionHandlers());
      }

      // Now connect
      const result = await socketConnectToHost();
      if (result.success) {
        if (result.requestId) {
          setPendingClientRequestId(result.requestId);
        }
        setStatusMsg("Connection request sent. Waiting for host approval...");
        toast.success("Request sent to host.");
      } else {
        const message = result.message || "Failed to send connection request";
        setStatusMsg(message);
        toast.error(message, { duration: 5000 });
      }
    } finally {
      setIsConnectingClient(false);
    }
  };

  // Upload handler - show PIN modal only if enabled, handle multiple files
  const handleUpload = async () => {
    console.log("handleUpload called");
    const inputEl = fileInputRef.current;
    console.log("Input element:", inputEl);
    console.log("Input element files:", inputEl?.files);
    console.log("Number of files:", inputEl?.files?.length);

    if (!inputEl || !inputEl.files || inputEl.files.length === 0) {
      console.error("No files selected!");
      setUploadError("Please select a file first.");
      setShowUploadError(true);
      return;
    }

    const files = Array.from(inputEl.files);
    console.log(
      "Selected files:",
      files.map((f) => f.name)
    );

    // Check file sizes (max 1GB each)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    const oversizedFiles = files.filter((f) => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      setUploadError(
        `File(s) too large: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}. Max size is 1GB per file.`
      );
      setShowUploadError(true);
      return;
    }

    // If PIN protection is enabled, show modal for first file (apply same PIN to all)
    if (pinProtectionEnabled) {
      setPendingFile(files); // Store all files
      setShowSetPinModal(true);
    } else {
      // Upload all files directly without PIN
      await uploadMultipleFiles(files, null);
    }
  };

  // Perform the actual upload with progress and speed tracking
  const performUpload = async (file, pin) => {
    if (!file) return;

    setStatusMsg(`Uploading ${file.name}...`);
    console.log(
      "Starting upload for file:",
      file.name,
      "Size:",
      file.size,
      "PIN:",
      pin ? "Yes" : "No"
    );

    // Initialize upload tracking
    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    setUploadingFiles((prev) => ({
      ...prev,
      [file.name]: {
        progress: 0,
        speed: "0 KB/s",
        loaded: 0,
        total: file.size,
      },
    }));

    try {
      // Create custom upload with progress tracking
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const apiBase = getApiBase();
        xhr.open("POST", `${apiBase.replace(/\/$/, "")}/upload`, true);
        xhr.withCredentials = true;

        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            const now = Date.now();
            const timeDiff = (now - lastTime) / 1000; // seconds
            const bytesDiff = e.loaded - lastLoaded;

            // Calculate speed
            let speed = "0 KB/s";
            if (timeDiff > 0) {
              const bytesPerSecond = bytesDiff / timeDiff;
              if (bytesPerSecond > 1024 * 1024) {
                speed = `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
              } else if (bytesPerSecond > 1024) {
                speed = `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
              } else {
                speed = `${bytesPerSecond.toFixed(0)} B/s`;
              }
            }

            const progress = Math.round((e.loaded / e.total) * 100);

            setUploadingFiles((prev) => ({
              ...prev,
              [file.name]: {
                progress,
                speed,
                loaded: e.loaded,
                total: e.total,
              },
            }));

            lastLoaded = e.loaded;
            lastTime = now;
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve({
                success: true,
                filename: json.filename || json.name,
                url: json.url,
                size: json.size || file.size,
                type: json.type || file.type,
                has_pin: json.has_pin || false,
              });
            } catch (err) {
              reject(new Error("Failed to parse server response"));
            }
          } else {
            let errorMsg = `Upload failed (${xhr.status})`;
            try {
              const errorJson = JSON.parse(xhr.responseText);
              if (errorJson.error) errorMsg = errorJson.error;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Upload timeout"));

        const fd = new FormData();
        fd.append("file", file);
        if (pin) fd.append("pin", pin);
        xhr.send(fd);
      });

      console.log("Upload result:", result);
      if (result.success) {
        setFiles((prev) => [
          {
            name: result.filename,
            url: result.url,
            size: result.size,
            mtime: Date.now(),
            type: result.type,
            has_pin: result.has_pin || false,
          },
          ...prev,
        ]);
        if (result.url) {
          setQrUrl(result.url);
          const pinMsg = result.has_pin ? " (PIN protected)" : "";
          setStatusMsg(`✓ Uploaded: ${result.filename}${pinMsg}`);
          toast.success(`${result.filename} uploaded successfully!`);
        } else {
          setStatusMsg("Upload succeeded but no URL returned.");
        }
        // Clear the file input and selected file name
        const inputEl = fileInputRef.current;
        if (inputEl) inputEl.value = "";
        setSelectedFileName("");
      }

      // Remove from uploading files after brief delay
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        });
      }, 1000);
    } catch (e) {
      console.error("Upload error:", e);
      setUploadError(
        e.message ||
          "Upload failed. Please check your connection and try again."
      );
      setShowUploadError(true);
      setStatusMsg("Upload failed");
      toast.error(`Failed to upload ${file.name}`);

      // Remove from uploading files
      setUploadingFiles((prev) => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });
    }
  };

  // Upload multiple files sequentially
  const uploadMultipleFiles = async (files, pin) => {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusMsg(`Uploading ${i + 1}/${files.length}: ${file.name}...`);

      try {
        await performUpload(file, pin);
        successCount++;
      } catch (e) {
        console.error(`Failed to upload ${file.name}:`, e);
        failCount++;
      }
    }

    // Show summary
    if (failCount === 0) {
      setStatusMsg(
        `✓ Successfully uploaded ${successCount} file${
          successCount > 1 ? "s" : ""
        }!`
      );
    } else {
      setStatusMsg(`Uploaded ${successCount} file(s), ${failCount} failed`);
    }
  };

  // Actual upload after PIN is set (or skipped)
  const handleUploadWithPin = async (pin) => {
    setShowSetPinModal(false);
    const files = pendingFile;
    setPendingFile(null);

    if (Array.isArray(files)) {
      await uploadMultipleFiles(files, pin);
    } else if (files) {
      await performUpload(files, pin);
    }
  };

  // Delete handlers
  const confirmDelete = (name) => {
    setDeleteTarget(name);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    const name = deleteTarget;
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (!name) return;

    // Store deleted file for potential undo
    const deletedFile = files.find((f) => f.name === name);

    try {
      await deleteFile(name);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      setStatusMsg("File deleted");

      // Show toast with undo option
      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <span>File deleted</span>
            <button
              onClick={() => {
                // Restore the file in UI (note: actual file is deleted from server)
                if (deletedFile) {
                  setFiles((prev) => [deletedFile, ...prev]);
                  toast.dismiss(t.id);
                  toast("File restored in UI (re-upload needed for server)", {
                    icon: "ℹ️",
                  });
                }
              }}
              className="ml-2 px-2 py-1 bg-white text-gray-900 rounded text-xs font-semibold hover:bg-gray-100"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    } catch (e) {
      setStatusMsg(e.message || "Delete failed");
      toast.error(e.message || "Failed to delete file");
    }
  };

  const handleToggleQR = () => {
    // Always update QR URL with latest device info when showing
    if (!qrVisible) {
      const url =
        deviceInfo.lan_url ||
        deviceInfo.host_url ||
        `http://${deviceInfo.lan_ip || deviceInfo.ip}:5000`;
      setQrUrl(url);
    }
    setQrVisible((v) => !v);
  };

  // Connection approval handlers
  const handleApproveConnection = async () => {
    if (pendingRequest && socketRef.current) {
      socketRef.current.emit("approve_request", {
        id: pendingRequest.id,
        sid: pendingRequest.sid,
      });
      if (pendingRequest.id) {
        try {
          await respondToConnectionRequest(pendingRequest.id, "approved");
        } catch (error) {
          console.warn("HTTP approval fallback failed", error);
        }
      }
      setStatusMsg(
        `Approved connection from ${pendingRequest.name || "Guest"}`
      );
    }
    setShowApprovalModal(false);
    setPendingRequest(null);
  };

  const handleDenyConnection = async () => {
    if (pendingRequest && socketRef.current) {
      socketRef.current.emit("deny_request", {
        id: pendingRequest.id,
        sid: pendingRequest.sid,
      });
      if (pendingRequest.id) {
        try {
          await respondToConnectionRequest(pendingRequest.id, "denied");
        } catch (error) {
          console.warn("HTTP deny fallback failed", error);
        }
      }
      setStatusMsg(`Denied connection from ${pendingRequest.name || "Guest"}`);
    }
    setShowApprovalModal(false);
    setPendingRequest(null);
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Header files={files} uploadingFiles={uploadingFiles} />

      <main className="transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white font-sans min-h-screen w-full">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="w-full min-w-0">
            {/* Connection Status Banner */}
            <ConnectionStatus
              isHost={isHost}
              isApproved={isApproved}
              statusMsg={statusMsg}
            />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              <ServerControl
                isHost={isHost}
                isApproved={isApproved}
                deviceInfo={deviceInfo}
                qrUrl={qrUrl}
                qrVisible={qrVisible}
                onStartServer={handleStartServer}
                onStopServer={handleStopServer}
                onConnectToHost={handleConnectToHost}
                onToggleQR={handleToggleQR}
                isConnectingClient={isConnectingClient}
              />

              <FileUploadZone
                fileInputRef={fileInputRef}
                onUpload={handleUpload}
                onFileSelect={(files) => {
                  // Files are already set in the ref by the component
                  console.log("Files selected:", files.length);
                  if (files && files.length > 0) {
                    setSelectedFileName(files[0].name);
                  }
                }}
                pinProtectionEnabled={pinProtectionEnabled}
                onTogglePinProtection={() =>
                  setPinProtectionEnabled(!pinProtectionEnabled)
                }
              />
            </div>

            <FileList
              files={files}
              statusMsg={
                isUploading ? `${statusMsg} (${uploadProgress}%)` : statusMsg
              }
              onDelete={confirmDelete}
              uploadingFiles={uploadingFiles}
            />
          </div>
        </div>

        <DeleteModal
          show={showDeleteModal}
          filename={deleteTarget}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />

        <ConnectionApprovalModal
          show={showApprovalModal}
          requesterName={pendingRequest?.name}
          onApprove={handleApproveConnection}
          onDeny={handleDenyConnection}
        />

        <UploadErrorModal
          show={showUploadError}
          error={uploadError}
          onClose={() => {
            setShowUploadError(false);
            setUploadError(null);
          }}
        />

        <SetPinModal
          show={showSetPinModal}
          onConfirm={handleUploadWithPin}
          onCancel={() => {
            setShowSetPinModal(false);
            setPendingFile(null);
          }}
        />

        <Footer />
      </main>
    </>
  );
}

export default App;
