import { useState } from "react";

const SetPinModal = ({ show, onConfirm, onCancel }) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  if (!show) return null;

  const handleConfirm = () => {
    setError("");

    if (!pin) {
      setError("Please enter a PIN");
      return;
    }

    if (pin.length < 4) {
      setError("PIN must be at least 4 characters");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    onConfirm(pin);
    setPin("");
    setConfirmPin("");
    setError("");
  };

  const handleSkip = () => {
    onConfirm(null); // Upload without PIN
    setPin("");
    setConfirmPin("");
    setError("");
  };

  const handleCancel = () => {
    onCancel();
    setPin("");
    setConfirmPin("");
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Set File PIN (Optional)
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-200 mb-4">
          Protect this file with a PIN. Receivers will need to enter the PIN to
          download it.
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
              placeholder="Enter PIN (min 4 characters)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Re-enter PIN"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleConfirm();
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
            onClick={handleSkip}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition"
          >
            Skip (No PIN)
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Set PIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPinModal;
