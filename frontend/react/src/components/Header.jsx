import { useState, useRef, useEffect } from "react";

const Header = () => {
  // Replace this with your actual GitHub repository URL
  const GITHUB_REPO = "https://github.com/mehmoodulhaq570/WifiX";
  const ISSUE_URL = `${GITHUB_REPO.replace(/\/$/, "")}/issues/new`;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-8 text-center text-white shadow-lg rounded-b-3xl">
        {/* Three-dot menu (top-right) */}
        <div ref={menuRef} className="absolute top-3 right-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
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
              <div className="fixed mt-2 w-52 bg-white text-gray-900 rounded-md shadow-xl right-4 z-50 ring-1 ring-black ring-opacity-5">
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowAbout(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 border-t transition"
                >
                  <span className="text-lg">ℹ️</span>
                  <span>About</span>
                </button>
                <a
                  href={ISSUE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 border-t transition"
                  onClick={() => setMenuOpen(false)}
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
                </a>
                <a
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
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
              <p className="text-sm">Settings panel coming soon...</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Future options:
                </p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Theme preference (Dark/Light mode)</li>
                  <li>Network settings</li>
                  <li>File retention period</li>
                  <li>Upload limits</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                About WifiX
              </h2>
              <button
                onClick={() => setShowAbout(false)}
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
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
