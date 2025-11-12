import { useState, useRef, useEffect } from "react";
import BugReportModal from "./BugReportModal";

const Header = () => {
  // C: Config-driven URLs from environment variables
  const GITHUB_REPO =
    import.meta.env.VITE_GITHUB_REPO ||
    "https://github.com/mehmoodulhaq570/WifiX";
  const ISSUE_URL = `${GITHUB_REPO.replace(/\/$/, "")}/issues/new`;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false); // C: Bug report modal

  // D: Theme toggle state (persisted to localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("wifix-theme") || "light";
  });

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // A: Close menu on click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // A: Escape key handler for menu and modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showSettings) {
          setShowSettings(false);
          menuButtonRef.current?.focus();
        } else if (showAbout) {
          setShowAbout(false);
          menuButtonRef.current?.focus();
        } else if (showBugReport) {
          setShowBugReport(false);
          menuButtonRef.current?.focus();
        } else if (menuOpen) {
          setMenuOpen(false);
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen, showSettings, showAbout, showBugReport]);

  // D: Apply theme to document and persist
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("wifix-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <header className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-8 text-center text-white shadow-lg rounded-b-3xl">
        {/* Three-dot menu (top-right) */}
        <div ref={menuRef} className="absolute top-3 right-4">
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition"
              title="Menu"
            >
              {/* Three-dot icon (vertical) */}
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Menu options"
                className="fixed mt-2 w-52 bg-white text-gray-900 rounded-md shadow-xl right-4 z-50 ring-1 ring-black ring-opacity-5"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowSettings(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition"
                >
                  {/* B: Settings SVG icon */}
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Settings</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowAbout(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 border-t transition"
                >
                  {/* B: About SVG icon */}
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-blue-600"
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
                  <span>About</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowBugReport(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 border-t transition"
                >
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="ml-1">Report Bug/Error</span>
                </button>
                <a
                  role="menuitem"
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 border-t transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .5C5.73.5.75 5.48.75 11.74c0 4.92 3.19 9.09 7.61 10.57.56.1.77-.24.77-.54 0-.27-.01-1-.02-1.96-3.09.67-3.74-1.49-3.74-1.49-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.15-3.01-.12-.28-.5-1.4.11-2.91 0 0 .94-.3 3.07 1.15.89-.25 1.84-.37 2.79-.38.95.01 1.9.13 2.79.38 2.13-1.45 3.07-1.15 3.07-1.15.61 1.51.23 2.63.11 2.91.71.79 1.15 1.79 1.15 3.01 0 4.27-2.6 5.21-5.08 5.49.39.34.73 1.03.73 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.21.65.78.54C19.06 20.83 22.25 16.66 22.25 11.74 22.25 5.48 17.27.5 12 .5z" />
                  </svg>
                  <span className="ml-1">GitHub Repository</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            WifiX Transfer
          </h1>
          <p className="opacity-90 text-sm md:text-base">
            Share your files wirelessly and securely
          </p>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2
                id="settings-title"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                Settings
              </h2>
              <button
                onClick={() => {
                  setShowSettings(false);
                  menuButtonRef.current?.focus();
                }}
                aria-label="Close settings"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              {/* D: Theme toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Theme</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Choose light or dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#d1d5db",
                  }}
                  aria-label={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                  } mode`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  More options coming soon:
                </p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Network settings</li>
                  <li>File retention period</li>
                  <li>Upload limits</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSettings(false);
                menuButtonRef.current?.focus();
              }}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2
                id="about-title"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                About WifiX
              </h2>
              <button
                onClick={() => {
                  setShowAbout(false);
                  menuButtonRef.current?.focus();
                }}
                aria-label="Close about"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                <strong>WifiX Transfer</strong> is a local area network (LAN)
                file sharing application that lets you share files wirelessly
                between devices on the same network.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Version:</strong> 1.0.0
                </p>
                <p className="text-sm">
                  <strong>Tech Stack:</strong>
                </p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Backend: Python Flask + Socket.IO</li>
                  <li>Frontend: React + Vite + Tailwind CSS</li>
                  <li>Real-time sync via WebSockets</li>
                </ul>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                © 2025 WifiX Transfer. Open source project.
              </p>
            </div>
            <button
              onClick={() => {
                setShowAbout(false);
                menuButtonRef.current?.focus();
              }}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      <BugReportModal
        show={showBugReport}
        onClose={() => {
          setShowBugReport(false);
          menuButtonRef.current?.focus();
        }}
        githubRepo={GITHUB_REPO}
      />
    </>
  );
};

export default Header;
