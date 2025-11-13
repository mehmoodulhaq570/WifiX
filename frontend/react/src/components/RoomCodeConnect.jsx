import React, { useState } from "react";

/**
 * RoomCodeConnect - Component for connecting to a server using a room code
 * Allows clients to enter a room code to discover and connect to a server
 */
export default function RoomCodeConnect({ onConnect }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWithCode = async () => {
    if (!code.trim()) {
      setError("Please enter a room code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, use a default server URL or prompt the user
      // In production, you might want to have a configurable API endpoint
      const apiUrl =
        prompt(
          "Enter the server URL (or leave empty for default):",
          "http://localhost:5000"
        ) || "http://localhost:5000";

      const response = await fetch(
        `${apiUrl}/api/room-code/${code.toUpperCase().trim()}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Call the onConnect callback with the connection details
        if (onConnect) {
          onConnect(data);
        } else {
          // Redirect to the URL
          window.location.href = data.url;
        }
      } else {
        setError(data.error || "Invalid or expired room code");
      }
    } catch (err) {
      setError("Failed to connect: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      connectWithCode();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        🔐 Connect with Room Code
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Enter a room code to quickly connect to a WifiX server without typing IP
        addresses.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., ABC123"
            maxLength={10}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl
                     font-bold tracking-wider uppercase
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={connectWithCode}
          disabled={loading || !code.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 
                   rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Connect"}
        </button>

        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                        rounded-lg p-3 text-red-600 dark:text-red-400 text-sm"
          >
            ⚠️ {error}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Room codes are case-insensitive
        </div>
      </div>
    </div>
  );
}
