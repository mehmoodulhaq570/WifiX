import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [deviceInfo] = useState({ ip: "192.168.1.5" });
  const fileInputRef = useRef(null);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // File upload
  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || e.dataTransfer.files);
    const newFiles = selectedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      mtime: Date.now(),
      type: f.type || "file",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

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

  // Delete file
  const handleDelete = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
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
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        } flex flex-col items-center font-sans`}
      >
        {/* Full-width container */}
        <div className="w-full max-w-[95rem] px-4 sm:px-8 lg:px-16 xl:px-20 mt-8 grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* ---------- Server Control ---------- */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center col-span-1">
            <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2 w-full">
              Server Control
            </h2>

            <div className="flex flex-col items-center gap-3 w-full">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md w-full sm:w-52 transition">
                Start Server
              </button>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md w-full sm:w-52 transition">
                Connect to Host
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                <strong>LAN Address:</strong> {deviceInfo.ip}
              </p>
              <div className="flex justify-center mt-2">
                <QRCode value={deviceInfo.ip} size={100} />
              </div>
            </div>
          </section>

          {/* ---------- Upload Files ---------- */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 col-span-2 flex flex-col">
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

            <div className="flex justify-center mt-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold transition w-full sm:w-auto">
                Upload
              </button>
            </div>
          </section>
        </div>

        {/* ---------- Available Files ---------- */}
        <section className="w-full max-w-[95rem] bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8 mb-10 mx-4">
          <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2">
            Available Files
          </h2>

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
                  {files.map((file, i) => (
                    <tr
                      key={i}
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
                          onClick={() => handleDelete(file.name)}
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
