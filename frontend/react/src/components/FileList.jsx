import { useState } from "react";
import VerifyPinModal from "./VerifyPinModal";

const FileList = ({ files, statusMsg, qrUrl, qrVisible, onDelete }) => {
  const [showVerifyPin, setShowVerifyPin] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
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

  return (
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
              {files.map((file) => {
                const handleDownload = () => {
                  if (file.has_pin) {
                    setPendingDownload(file);
                    setShowVerifyPin(true);
                  } else {
                    window.location.href = file.url;
                  }
                };

                return (
                  <tr
                    key={file.name}
                    className="border-b hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {file.has_pin && (
                          <span className="text-yellow-600 dark:text-yellow-400" title="PIN Protected">
                            🔒
                          </span>
                        )}
                        <span>{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{(file.size / 1024).toFixed(2)} KB</td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(file.mtime).toLocaleString()}
                    </td>
                    <td className="p-3">{file.type}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleDownload}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm sm:text-base"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => onDelete(file.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm sm:text-base"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No files found in the shared folder.
        </div>
      )}

      <VerifyPinModal
        show={showVerifyPin}
        filename={pendingDownload?.name}
        onVerify={(pin) => {
          setShowVerifyPin(false);
          if (pendingDownload) {
            // Download with PIN as query parameter
            const url = new URL(pendingDownload.url);
            url.searchParams.set('pin', pin);
            window.location.href = url.toString();
          }
          setPendingDownload(null);
        }}
        onCancel={() => {
          setShowVerifyPin(false);
          setPendingDownload(null);
        }}
      />
    </section>
  );
};

export default FileList;
