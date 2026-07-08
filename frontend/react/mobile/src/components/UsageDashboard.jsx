import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const UsageDashboard = ({ files, uploadingFiles }) => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    todaySize: 0,
    todayFiles: 0,
    uploadHistory: [], // { timestamp, size, filename }
  });

  const [showGraph, setShowGraph] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem("wifix-usage-stats");
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats(parsed);
      } catch (e) {
        console.error("Failed to parse usage stats:", e);
      }
    }
  }, []);

  // Update stats when files change
  useEffect(() => {
    if (files.length === 0) return;

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    let totalSize = 0;
    let todaySize = 0;
    let todayFiles = 0;

    files.forEach((file) => {
      totalSize += file.size || 0;

      // Check if file was uploaded today
      const fileTimestamp = file.uploaded_at
        ? new Date(file.uploaded_at).getTime()
        : 0;
      if (fileTimestamp >= startOfDay) {
        todaySize += file.size || 0;
        todayFiles++;
      }
    });

    const newStats = {
      totalFiles: files.length,
      totalSize,
      todaySize,
      todayFiles,
      uploadHistory: stats.uploadHistory || [],
    };

    setStats(newStats);
    localStorage.setItem("wifix-usage-stats", JSON.stringify(newStats));
  }, [files]);

  // Track new uploads
  useEffect(() => {
    if (Object.keys(uploadingFiles).length > 0) {
      // Find completed uploads (progress = 100)
      Object.entries(uploadingFiles).forEach(([filename, data]) => {
        if (data.progress === 100) {
          // Add to upload history if not already recorded
          const alreadyRecorded = stats.uploadHistory.some(
            (entry) =>
              entry.filename === filename && entry.timestamp > Date.now() - 5000
          );

          if (!alreadyRecorded) {
            const newHistory = [
              ...stats.uploadHistory,
              {
                timestamp: Date.now(),
                size: data.total || 0,
                filename: filename,
              },
            ].slice(-100); // Keep last 100 uploads

            const newStats = {
              ...stats,
              uploadHistory: newHistory,
            };
            setStats(newStats);
            localStorage.setItem("wifix-usage-stats", JSON.stringify(newStats));
          }
        }
      });
    }
  }, [uploadingFiles]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Generate graph data (last 7 days)
  const generateGraphData = () => {
    const days = 7;
    const now = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const startOfDay = date.getTime();
      const endOfDay = startOfDay + 86400000; // 24 hours

      const dayUploads = stats.uploadHistory.filter(
        (entry) => entry.timestamp >= startOfDay && entry.timestamp < endOfDay
      );

      const totalSize = dayUploads.reduce(
        (sum, entry) => sum + (entry.size || 0),
        0
      );

      data.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        size: totalSize,
        count: dayUploads.length,
      });
    }

    return data;
  };

  const graphData = generateGraphData();
  const maxSize = Math.max(...graphData.map((d) => d.size), 1);

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md transition"
        >
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            {stats.totalFiles}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Total Files
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-300">
            {formatBytes(stats.totalSize)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Total Data
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
            {stats.todayFiles}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Today's Files
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
            {formatBytes(stats.todaySize)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Today's Data
          </div>
        </div>
      </div>

      {/* Graph */}
      {showGraph && (
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Last 7 Days Activity
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {graphData.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="relative w-full flex items-end justify-center h-32 group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer"
                    style={{
                      height: `${(day.size / maxSize) * 100}%`,
                      minHeight: day.size > 0 ? "4px" : "0",
                    }}
                    title={`${day.date}: ${formatBytes(day.size)} (${
                      day.count
                    } files)`}
                  />

                  {/* Tooltip */}
                  {day.size > 0 && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      <div className="font-semibold">{day.date}</div>
                      <div>{formatBytes(day.size)}</div>
                      <div>
                        {day.count} file{day.count !== 1 ? "s" : ""}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {day.label}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded" />
                <span>Data transferred</span>
              </div>
              <div className="flex items-center gap-2">
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
                <span>Hover bars for details</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Stats Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            if (
              confirm("Are you sure you want to reset all usage statistics?")
            ) {
              const emptyStats = {
                totalFiles: 0,
                totalSize: 0,
                todaySize: 0,
                todayFiles: 0,
                uploadHistory: [],
              };
              setStats(emptyStats);
              localStorage.setItem(
                "wifix-usage-stats",
                JSON.stringify(emptyStats)
              );
            }
          }}
          className="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 underline"
        >
          Reset Statistics
        </button>
      </div>
    </div>
  );
};

UsageDashboard.propTypes = {
  files: PropTypes.array.isRequired,
  uploadingFiles: PropTypes.object,
};

UsageDashboard.defaultProps = {
  uploadingFiles: {},
};

export default UsageDashboard;
