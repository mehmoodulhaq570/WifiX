import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const ConnectedDevices = ({ socket, isHost }) => {
  const [connectedClients, setConnectedClients] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for client list updates
    const handleClientListUpdate = (data) => {
      setConnectedClients(data.clients || []);
    };

    socket.on("client_list_update", handleClientListUpdate);

    // Request initial client list if we're the host
    if (isHost) {
      socket.emit("request_client_list");
    }

    return () => {
      socket.off("client_list_update", handleClientListUpdate);
    };
  }, [socket, isHost]);

  const handleDisconnectClient = (clientSid) => {
    if (!socket) return;

    socket.emit("disconnect_client", { sid: clientSid });
    toast.success("Client disconnected", { duration: 2000 });
  };

  const formatConnectionTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Only show this component if we're the host
  if (!isHost || connectedClients.length === 0) {
    return null;
  }

  return (
    <section className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-blue-900/20 p-6 border-0 dark:border dark:border-slate-800">
      <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2 flex items-center gap-2">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Connected Devices ({connectedClients.length})
      </h2>

      <div className="space-y-3">
        {connectedClients.map((client) => (
          <div
            key={client.sid}
            className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {client.name || "Anonymous User"}
                  </h3>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Connected {formatConnectionTime(client.connectedAt)}
                  </p>
                  {client.ip && (
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      {client.ip}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDisconnectClient(client.sid)}
                className="ml-2 p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-md transition flex items-center justify-center"
                title="Disconnect this client"
                aria-label={`Disconnect ${client.name || "client"}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-300 bg-blue-50 dark:bg-slate-800 p-3 rounded-lg">
        <p className="flex items-center gap-2">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Only approved clients are shown here
        </p>
      </div>
    </section>
  );
};

ConnectedDevices.propTypes = {
  socket: PropTypes.object,
  isHost: PropTypes.bool.isRequired,
};

export default ConnectedDevices;
