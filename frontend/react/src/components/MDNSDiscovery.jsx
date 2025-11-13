import React, { useState, useEffect } from "react";

/**
 * MDNSDiscovery - Component for discovering WifiX servers on the local network via mDNS
 * Displays mDNS information and allows easy connection
 */
export default function MDNSDiscovery({ serverInfo }) {
  const [mdnsInfo, setMdnsInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Extract mDNS info from serverInfo if available
    if (serverInfo?.mdns) {
      setMdnsInfo(serverInfo.mdns);
    }
  }, [serverInfo]);

  const copyMdnsUrl = () => {
    if (mdnsInfo?.url) {
      navigator.clipboard.writeText(mdnsInfo.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyHostname = () => {
    if (mdnsInfo?.hostname) {
      navigator.clipboard.writeText(mdnsInfo.hostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mdnsInfo || !mdnsInfo.running) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          🌐 mDNS Discovery
        </h3>

        <div className="text-center py-6">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            mDNS service is not available
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Enable mDNS in server settings to use network discovery
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        🌐 mDNS Discovery
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This server is discoverable on your local network using a friendly
        hostname.
      </p>

      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            mDNS Active
          </span>
        </div>

        {/* Hostname Display */}
        <div
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 
                      rounded-lg p-4"
        >
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Friendly Hostname
          </div>
          <div className="font-mono text-lg font-semibold text-purple-600 dark:text-purple-400 break-all">
            {mdnsInfo.hostname}
          </div>
        </div>

        {/* URL Display */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Access URL
          </div>
          <div className="font-mono text-sm text-blue-600 dark:text-blue-400 break-all">
            {mdnsInfo.url}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={copyHostname}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 
                     rounded-lg transition-colors text-sm"
          >
            {copied ? "✓ Copied!" : "Copy Hostname"}
          </button>
          <button
            onClick={copyMdnsUrl}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 
                     rounded-lg transition-colors text-sm"
          >
            Copy URL
          </button>
        </div>

        {/* Info Box */}
        <div
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                      rounded-lg p-3"
        >
          <div className="flex gap-2">
            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>How to use:</strong> On the same network, you can access
              this server by typing the hostname in your browser instead of the
              IP address. Works on most modern devices!
            </div>
          </div>
        </div>

        {/* Service Name */}
        {mdnsInfo.service_name && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            Service: {mdnsInfo.service_name}
          </div>
        )}
      </div>
    </div>
  );
}
