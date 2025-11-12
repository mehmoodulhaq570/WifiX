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

  return (
    <header className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-8 text-center text-white shadow-lg rounded-b-3xl">
      {/* GitHub button + dropdown (top-right) */}
      <div ref={menuRef} className="absolute top-3 right-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            title="Open project menu"
          >
            {/* GitHub icon */}
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.73.5.75 5.48.75 11.74c0 4.92 3.19 9.09 7.61 10.57.56.1.77-.24.77-.54 0-.27-.01-1-.02-1.96-3.09.67-3.74-1.49-3.74-1.49-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.15-3.01-.12-.28-.5-1.4.11-2.91 0 0 .94-.3 3.07 1.15.89-.25 1.84-.37 2.79-.38.95.01 1.9.13 2.79.38 2.13-1.45 3.07-1.15 3.07-1.15.61 1.51.23 2.63.11 2.91.71.79 1.15 1.79 1.15 3.01 0 4.27-2.6 5.21-5.08 5.49.39.34.73 1.03.73 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.21.65.78.54C19.06 20.83 22.25 16.66 22.25 11.74 22.25 5.48 17.27.5 12 .5z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="mt-2 w-44 bg-white text-gray-900 rounded-md shadow-lg right-0 origin-top-right ring-1 ring-black ring-opacity-5">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Open Repository
              </a>
              <a
                href={ISSUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm hover:bg-gray-100 border-t"
                onClick={() => setMenuOpen(false)}
              >
                Report an Issue
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">WifiX Transfer</h1>
        <p className="opacity-90 text-sm md:text-base">
          Share your files wirelessly and securely
        </p>
      </div>
    </header>
  );
};

export default Header;
