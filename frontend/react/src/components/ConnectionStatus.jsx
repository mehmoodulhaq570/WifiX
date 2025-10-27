const ConnectionStatus = ({ isHost, isApproved, statusMsg }) => {
  const getStatusColor = () => {
    if (isHost) return "bg-green-100 border-green-500 text-green-800";
    if (isApproved) return "bg-blue-100 border-blue-500 text-blue-800";
    return "bg-yellow-100 border-yellow-500 text-yellow-800";
  };

  const getStatusIcon = () => {
    if (isHost) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (isApproved) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  };

  return (
    <div
      className={`border-l-4 p-4 rounded-lg ${getStatusColor()} flex items-center gap-3 mb-4`}
    >
      {getStatusIcon()}
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {isHost ? "Hosting" : isApproved ? "Connected" : "Status"}
        </p>
        <p className="text-xs opacity-90">{statusMsg}</p>
      </div>
    </div>
  );
};

export default ConnectionStatus;
