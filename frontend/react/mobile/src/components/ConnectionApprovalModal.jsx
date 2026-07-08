const ConnectionApprovalModal = ({
  show,
  requesterName,
  onApprove,
  onDeny,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 w-11/12 max-w-md transform transition-all">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4">
            <svg
              className="w-12 h-12 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-white">
          Connection Request
        </h3>

        <p className="text-base text-slate-700 dark:text-slate-200 mb-2 text-center">
          <strong className="text-blue-600 dark:text-blue-400">
            {requesterName || "A user"}
          </strong>{" "}
          wants to connect to your server.
        </p>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 text-center">
          Do you want to allow this connection?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onDeny}
            className="px-6 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold transition-all transform hover:scale-105"
          >
            Deny
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Allow Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionApprovalModal;
