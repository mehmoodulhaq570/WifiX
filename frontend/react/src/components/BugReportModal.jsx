import { useState } from "react";
import toast from "react-hot-toast";

const BugReportModal = ({ show, onClose, githubRepo }) => {
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");

  if (!show) return null;

  // Collect environment info
  const getEnvironmentInfo = () => {
    const nav = navigator;
    return {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      online: nav.onLine,
      cookiesEnabled: nav.cookieEnabled,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  };

  const formatBugReport = () => {
    const env = getEnvironmentInfo();

    return `## Bug Report

### Description
${description || "_No description provided_"}

### Steps to Reproduce
${steps || "_No steps provided_"}

### Expected Behavior
${expected || "_Not specified_"}

### Actual Behavior
${actual || "_Not specified_"}

### Environment
- **Browser**: ${env.userAgent}
- **Platform**: ${env.platform}
- **Language**: ${env.language}
- **Screen**: ${env.screenResolution} (viewport: ${env.viewport})
- **Online**: ${env.online ? "Yes" : "No"}
- **Cookies**: ${env.cookiesEnabled ? "Enabled" : "Disabled"}
- **URL**: ${env.url}
- **Timestamp**: ${env.timestamp}
`;
  };

  const handleCopyToClipboard = () => {
    const report = formatBugReport();
    navigator.clipboard.writeText(report);
    toast.success("Bug report copied to clipboard!", { duration: 3000 });
  };

  const handleOpenGitHub = () => {
    const report = formatBugReport();
    const title = encodeURIComponent(description.slice(0, 80) || "Bug Report");
    const body = encodeURIComponent(report);
    const issueUrl = `${githubRepo}/issues/new?title=${title}&body=${body}`;
    window.open(issueUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening GitHub issues...");
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error("Please provide a bug description");
      return;
    }
    handleCopyToClipboard();
    setTimeout(() => {
      handleOpenGitHub();
      onClose();
      // Reset form
      setDescription("");
      setSteps("");
      setExpected("");
      setActual("");
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-report-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2
            id="bug-report-title"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Report a Bug
          </h2>
          <button
            onClick={onClose}
            aria-label="Close bug report"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg
              className="w-6 h-6"
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

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Help us improve WifiX by reporting bugs. Your environment info will
            be automatically included.
          </p>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Bug Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Steps to Reproduce
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Expected Behavior
              </label>
              <textarea
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="What should happen..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Actual Behavior
              </label>
              <textarea
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                placeholder="What actually happened..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={2}
              />
            </div>
          </div>

          {/* Environment preview */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-xs">
            <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">
              Auto-included environment:
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              {navigator.userAgent.slice(0, 80)}... • {navigator.platform}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-md transition font-medium"
            >
              📋 Copy Report
            </button>
            <button
              onClick={handleSubmit}
              disabled={!description.trim()}
              className={`flex-1 px-4 py-2 rounded-md transition font-medium ${
                description.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Copy & Open GitHub
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            The report will be copied to your clipboard and GitHub issues will
            open in a new tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BugReportModal;
