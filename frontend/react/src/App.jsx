import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

// Components
import Header from "./components/Header";
import ServerControl from "./components/ServerControl";
import FileUploadZone from "./components/FileUploadZone";
import FileList from "./components/FileList";
import DeleteModal from "./components/DeleteModal";
import DarkModeToggle from "./components/DarkModeToggle";
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
import { fetchDeviceInfo, fetchFiles, deleteFile } from "./utils/api";

function App() {
  const [files, setFiles] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
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

  // Auth initialization
  const handleAuthComplete = async () => {
    const info = await fetchDeviceInfo();
    if (info) {
      setDeviceInfo((d) => ({ ...d, ...info }));
    }
    await initSocket();

    // Setup socket event handlers
    setupSocketHandlers({
      onRequestApproved: () => {
        setIsApproved(true);
        setStatusMsg("Connected to host.");
        loadFiles();
      },
      onRequestDenied: () => {
        setStatusMsg("Connection denied by host.");
      },
      onIncomingRequest: (data) => {
        // Show modal instead of browser confirm
        setPendingRequest(data);
        setShowApprovalModal(true);
      },
      onHostStatus: (st) => {
        if (st && st.available === false) {
          setStatusMsg("Host is not available.");
        }
      },
      onHostDisconnected: (data) => {
        // Host has stopped - clear everything
        console.log("Host disconnected:", data);
        setIsApproved(false);
        setIsHost(false);
        setFiles([]);
        setStatusMsg("Host has disconnected. All connections lost.");
      },
    });
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

  // Server control handlers
  const handleStartServer = async () => {
    const result = await socketStartServer();
    if (result.success) {
      setIsHost(true);
      const info = await fetchDeviceInfo();
      if (info) {
        setDeviceInfo((d) => ({ ...d, ...info }));
      }
      // Load existing files when becoming host
      await loadFiles();
      setStatusMsg("Server started. Waiting for connections...");
      toast.success("Server started successfully!");
    } else {
      toast.error(
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
    // Ensure socket is initialized and handlers are set up before connecting
    const socket = socketRef.current || (await initSocket());
    if (!socket) {
      setStatusMsg("Failed to initialize socket connection");
      return;
    }

    // Setup handlers if not already done
    setupSocketHandlers({
      onRequestApproved: () => {
        setIsApproved(true);
        setStatusMsg("Connected to host.");
        loadFiles();
      },
      onRequestDenied: () => {
        setStatusMsg("Connection denied by host.");
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

    // Now connect
    const result = await socketConnectToHost();
    if (result.success) {
      setStatusMsg("Connection request sent. Waiting for host approval...");
    } else {
      setStatusMsg(result.message || "Failed to send connection request");
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
        const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
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
  const handleApproveConnection = () => {
    if (pendingRequest && socketRef.current) {
      socketRef.current.emit("approve_request", { sid: pendingRequest.sid });
      setStatusMsg(
        `Approved connection from ${pendingRequest.name || "Guest"}`
      );
    }
    setShowApprovalModal(false);
    setPendingRequest(null);
  };

  const handleDenyConnection = () => {
    if (pendingRequest && socketRef.current) {
      socketRef.current.emit("deny_request", { sid: pendingRequest.sid });
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
      <Header />

      <main
        className={`transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        } font-sans py-6 min-h-screen`}
      >
        <div className="w-full px-4 md:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-none md:rounded-3xl shadow-none md:shadow-2xl p-6 md:p-8 -mt-0 md:-mt-12 w-full">
            {/* Connection Status Banner */}
            <ConnectionStatus
              isHost={isHost}
              isApproved={isApproved}
              statusMsg={statusMsg}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <DarkModeToggle
          darkMode={darkMode}
          onToggle={() => setDarkMode(!darkMode)}
        />

        <Footer />
      </main>
    </>
  );
}

export default App;
