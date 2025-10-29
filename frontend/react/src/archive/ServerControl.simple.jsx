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
        <div className="flex flex-col items-center gap-2 mt-2">
          <div>
            <QRCode
              value={
                deviceInfo.lan_url || deviceInfo.host_url || deviceInfo.ip
              }
              size={80}
            />
          </div>
          <div className="mt-2">
            <button
              onClick={onToggleQR}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition"
            >
              {qrVisible ? "Hide QR" : "Show QR"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServerControl;
