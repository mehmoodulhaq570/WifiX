import React, { useState, useEffect } from "react";
import RoomCodeGenerator from "./RoomCodeGenerator";
import RoomCodeConnect from "./RoomCodeConnect";
import MDNSDiscovery from "./MDNSDiscovery";

/**
 * ConnectionHub - Main component that combines Room Codes and mDNS discovery
 * Provides a unified interface for easy server connection methods
 */
export default function ConnectionHub({ serverUrl, isHost = false }) {
  const [serverInfo, setServerInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(isHost ? "generate" : "connect");
  const [loading, setLoading] = useState(true);

  // Fetch server info on mount
  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const response = await fetch(`${serverUrl}/info`);
        const data = await response.json();
        setServerInfo(data);
      } catch (err) {
        console.error("Failed to fetch server info:", err);
      } finally {
        setLoading(false);
      }
    };

    if (serverUrl) {
      fetchServerInfo();
    }
  }, [serverUrl]);

  const handleConnect = (connectionDetails) => {
    console.log("Connecting to:", connectionDetails);
    // Redirect to the discovered server
    window.location.href = connectionDetails.url;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Loading connection options...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔗 Easy Connection Methods
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect to WifiX servers without remembering IP addresses
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 inline-flex">
          {isHost && (
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "generate"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Generate Code
            </button>
          )}
          <button
            onClick={() => setActiveTab("connect")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "connect"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Connect with Code
          </button>
          <button
            onClick={() => setActiveTab("mdns")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "mdns"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            mDNS Discovery
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div>
          {activeTab === "generate" && isHost && (
            <RoomCodeGenerator serverUrl={serverUrl} />
          )}
          {activeTab === "connect" && (
            <RoomCodeConnect onConnect={handleConnect} />
          )}
          {activeTab === "mdns" && <MDNSDiscovery serverInfo={serverInfo} />}
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Room Codes Info */}
          {(activeTab === "generate" || activeTab === "connect") && (
            <div
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 
                          rounded-lg shadow-md p-6"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🔑</span>
                Room Codes
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    ✓
                  </span>
                  <span>Short, memorable codes (e.g., ABC123)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    ✓
                  </span>
                  <span>No need to remember IP addresses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    ✓
                  </span>
                  <span>Easy to share verbally or in messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    ✓
                  </span>
                  <span>Automatic expiration for security</span>
                </li>
              </ul>
            </div>
          )}

          {/* mDNS Info */}
          {activeTab === "mdns" && (
            <div
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 
                          rounded-lg shadow-md p-6"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                mDNS Discovery
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                    ✓
                  </span>
                  <span>Automatic network discovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                    ✓
                  </span>
                  <span>Human-readable hostnames (e.g., mydevice.local)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                    ✓
                  </span>
                  <span>Works within the same local network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                    ✓
                  </span>
                  <span>No configuration required</span>
                </li>
              </ul>
            </div>
          )}

          {/* Traditional Method */}
          {serverInfo && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Traditional Connection
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Local IP
                  </div>
                  <div
                    className="bg-white dark:bg-gray-700 rounded px-3 py-2 font-mono text-sm 
                              text-gray-900 dark:text-white break-all"
                  >
                    {serverInfo.lan_ip}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    URL
                  </div>
                  <div
                    className="bg-white dark:bg-gray-700 rounded px-3 py-2 font-mono text-sm 
                              text-blue-600 dark:text-blue-400 break-all"
                  >
                    {serverInfo.lan_url}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
