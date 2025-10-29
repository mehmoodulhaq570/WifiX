import QRCode from "react-qr-code";

const ServerControl = ({
  isHost,
  deviceInfo,
  qrUrl,
  qrVisible,
  onStartServer,
  onStopServer,
  onConnectToHost,
  onToggleQR,
}) => {
  return (
    <section className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
      <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2 w-full">
        Server Control
      </h2>

      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={isHost ? onStopServer : onStartServer}
          className={`font-semibold px-6 py-2 rounded-md w-full sm:w-52 transition ${
            isHost
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isHost ? "Stop Server" : "Start Server"}
        </button>
        <button
          onClick={onConnectToHost}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md w-full sm:w-52 transition"
        >
          Connect to Host
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          <strong>LAN Address:</strong> {deviceInfo.lan_ip || deviceInfo.ip}
        </p>
        <div className="flex flex-col items-center gap-3 mt-2 w-full">
          <button
            onClick={onToggleQR}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-semibold transition w-full sm:w-52 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            {qrVisible ? "Hide QR Code" : "Show QR Code"}
          </button>

          {qrVisible && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg border-2 border-blue-500">
              <QRCode
                value={
                  deviceInfo.lan_url ||
                  deviceInfo.host_url ||
                  `http://${deviceInfo.lan_ip || deviceInfo.ip}:5000`
                }
                size={150}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                Scan to connect
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServerControl;
