import { useState, useRef, useEffect } from "react";
import "./App.css";

// Components
import Header from "./components/Header";
import ServerControl from "./components/ServerControl";
import FileUploadZone from "./components/FileUploadZone";
import FileList from "./components/FileList";
import DeleteModal from "./components/DeleteModal";
import DarkModeToggle from "./components/DarkModeToggle";
import Footer from "./components/Footer";

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
        const name = data?.name || "Guest";
        const sid = data?.sid;
        const ok = window.confirm(`${name} wants to connect. Allow?`);
        if (ok) socketRef.current.emit("approve_request", { sid });
        else socketRef.current.emit("deny_request", { sid });
      },
      onHostStatus: (st) => {
        if (st && st.available === false)
          setStatusMsg("Host is not available.");
      },
    });
  };

  useAuth(handleAuthComplete);

  // Server control handlers
  const handleStartServer = async () => {
    const result = await socketStartServer();
    if (result.success) {
      setIsHost(true);
      const info = await fetchDeviceInfo();
      if (info) {
        setDeviceInfo((d) => ({ ...d, ...info }));
      }
    } else {
      alert(
        "Unable to connect to backend Socket.IO. Make sure the backend is running and reachable."
      );
    }
  };

  const handleStopServer = async () => {
    await socketStopServer();
    setIsHost(false);
    setStatusMsg("Hosting stopped");
  };

  const handleConnectToHost = async () => {
    const displayName =
      window.prompt("Name to show to host (optional)") || "Guest";
    const result = await socketConnectToHost(displayName);
    if (result.success) {
      setStatusMsg("Connection request sent. Waiting for host approval...");
    } else {
      setStatusMsg(result.message || "Connection failed");
    }
  };

  // Upload handler
  const handleUpload = async () => {
    const inputEl = fileInputRef.current;
    const file = inputEl && inputEl.files && inputEl.files[0];
    if (!file) {
      setStatusMsg("Please select a file first.");
      return;
    }
    setStatusMsg(`Uploading ${file.name}...`);
    try {
      const result = await uploadFile(file);
      if (result.success) {
        setFiles((prev) => [
          {
            name: result.filename,
            url: result.url,
            size: result.size,
            mtime: Date.now(),
            type: result.type,
          },
          ...prev,
        ]);
        if (result.url) {
          setQrUrl(result.url);
          setStatusMsg(`Uploaded: ${result.url}`);
        } else {
          setStatusMsg("Upload succeeded but no URL returned.");
        }
      }
    } catch (e) {
      setStatusMsg(e.message || "Upload failed");
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
    try {
      await deleteFile(name);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      setStatusMsg("File deleted");
    } catch (e) {
      setStatusMsg(e.message || "Delete failed");
    }
  };

  const handleToggleQR = () => {
    if (!qrUrl) {
      setQrUrl(
        deviceInfo.lan_url || deviceInfo.host_url || deviceInfo.ip
      );
    }
    setQrVisible((v) => !v);
  };

  return (
    <>
      <Header />

      <main
        className={`transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        } font-sans py-12`}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 -mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ServerControl
                isHost={isHost}
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
              />
            </div>

            <FileList
              files={files}
              statusMsg={
                isUploading
                  ? `${statusMsg} (${uploadProgress}%)`
                  : statusMsg
              }
              qrUrl={qrUrl}
              qrVisible={qrVisible}
              onDelete={confirmDelete}
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
