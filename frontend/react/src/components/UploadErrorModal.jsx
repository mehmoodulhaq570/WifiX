const UploadErrorModal = ({ show, error, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-11/12 max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 rounded-full p-4">
            <svg
              className="w-12 h-12 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-white">
          Upload Failed
        </h3>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 text-center">
          {error || "An error occurred while uploading the file. Please try again."}
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadErrorModal;
