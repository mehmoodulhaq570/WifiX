const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8">
      <button
        onClick={onToggle}
        className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full p-3 shadow hover:scale-105 transition text-xl"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
};

export default DarkModeToggle;
