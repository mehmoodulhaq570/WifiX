import QRCode from "react-qr-code";
import { useState } from "react";
import toast from "react-hot-toast";

const ServerControl = ({
  isHost,
  isApproved,
  deviceInfo,
  qrUrl,
  qrVisible,
  onStartServer,
  onStopServer,
  onConnectToHost,
  onToggleQR,
}) => {
  const shareUrl =
    deviceInfo.lan_url ||
    deviceInfo.host_url ||
    `http://${deviceInfo.lan_ip || deviceInfo.ip}:5000`;

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | { ok: bool, status?: number, msg?: string }

  // Disable the "Become Host" button when this client is already connected to a host
  const disableBecomeHost = !isHost && !!isApproved;
  return (
    <section className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-blue-900/20 p-6 flex flex-col items-center text-center border-0 dark:border dark:border-slate-800">
      <h2 className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 border-b dark:border-slate-700 pb-2 w-full">
        Connection
      </h2>

      {/* Role Selection */}
      <div className="flex flex-col items-center gap-3 w-full mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg w-full border border-blue-100 dark:border-slate-600">
          <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
            Choose your role:
          </p>
          <button
            onClick={isHost ? onStopServer : onStartServer}
            disabled={disableBecomeHost}
            className={`font-semibold px-6 py-2 rounded-md w-full transition mb-2 ${
              isHost
                ? "bg-red-600 hover:bg-red-700 text-white"
                : disableBecomeHost
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isHost ? "🛑 Stop Hosting" : "🏠 Become Host"}
          </button>
          <button
            onClick={onConnectToHost}
            disabled={isHost}
            className={`font-semibold px-6 py-2 rounded-md w-full transition ${
              isHost
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            👥 Connect as Client
          </button>
        </div>
      </div>

      {/* Shareable Link Section */}
      <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
          Share this link:
        </p>
        <div>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200"
          />
        </div>
        <div className="mt-2 flex w-full justify-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success("Link copied to clipboard!", { duration: 2000 });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition"
          >
            📋 Copy
          </button>
          <button
            onClick={async () => {
              setTestLoading(true);
              setTestResult(null);
              try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                const infoUrl = `${shareUrl.replace(/\/$/, "")}/info`;
                const res = await fetch(infoUrl, { signal: controller.signal });
                clearTimeout(timeout);
                if (!res.ok) {
                  setTestResult({
                    ok: false,
                    status: res.status,
                    msg: res.statusText,
                  });
                } else {
                  const data = await res.json();
                  setTestResult({
                    ok: true,
                    status: res.status,
                    msg: data.host_url || "OK",
                  });
                }
              } catch (e) {
                setTestResult({
                  ok: false,
                  msg: e.name === "AbortError" ? "timeout" : e.message,
                });
              } finally {
                setTestLoading(false);
              }
            }}
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition"
          >
            {testLoading ? "Testing..." : "Test connection"}
          </button>
        </div>
        {testResult && (
          <div className="mt-2 text-sm">
            {testResult.ok ? (
              <span className="text-green-700">
                ✅ Reachable — {testResult.msg}
              </span>
            ) : (
              <span className="text-red-700">
                ❌ Not reachable
                {testResult.status ? ` (HTTP ${testResult.status})` : ""}
                {testResult.msg ? ` — ${testResult.msg}` : ""}
              </span>
            )}
          </div>
        )}
        {/* Connection help and zeroconf instructions removed per user request */}
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-slate-600 dark:text-slate-200 text-sm">
          <strong>LAN IP:</strong> {deviceInfo.lan_ip || deviceInfo.ip}
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
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border-2 border-blue-500">
              <QRCode
                value={
                  deviceInfo.lan_url ||
                  deviceInfo.host_url ||
                  `http://${deviceInfo.lan_ip || deviceInfo.ip}:5000`
                }
                size={150}
              />
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 text-center">
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
