import { useState } from "react";

const VerifyPinModal = ({ show, filename, onVerify, onCancel }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!show) return null;

  const handleVerify = () => {
    if (!pin) {
      setError("Please enter the PIN");
      return;
    }

    onVerify(pin);
    setPin("");
    setError("");
  };

  const handleCancel = () => {
    onCancel();
    setPin("");
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔒 PIN Protected File
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-200 mb-4">
          This file is protected. Enter the PIN to download:
        </p>

        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 truncate">
          {filename}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Verify & Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPinModal;
