import React, { useState } from "react";
import { getApiBase } from "../utils/api";

/**
 * RoomCodeGenerator - Component for generating and displaying room codes
 * Allows hosts to create shareable room codes for easy connection
 */
export default function RoomCodeGenerator({ serverUrl }) {
  const [roomCode, setRoomCode] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const apiBase = serverUrl || getApiBase();
      const response = await fetch(`${apiBase}/api/room-code/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: roomName || undefined }),
      });

      const data = await response.json();

      if (data.success) {
        setRoomCode(data);
      } else {
        setError(data.error || "Failed to generate room code");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyUrl = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        🔑 Generate Room Code
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Create a short, memorable code that others can use to connect to this
        server easily.
      </p>

      {!roomCode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Name (Optional)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Meeting Room A"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={generateCode}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Room Code"}
          </button>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm mt-2">
              ⚠️ {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 
                        rounded-lg p-6 text-center"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Your Room Code
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-2">
              {roomCode.code}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {roomCode.name}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 
                       rounded-lg transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
            <button
              onClick={copyUrl}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 
                       rounded-lg transition-colors"
            >
              Copy URL
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Share this code with others so they can easily connect
          </div>

          <button
            onClick={() => {
              setRoomCode(null);
              setRoomName("");
              setCopied(false);
            }}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 
                     dark:hover:text-gray-200 text-sm"
          >
            Generate New Code
          </button>
        </div>
      )}
    </div>
  );
}
