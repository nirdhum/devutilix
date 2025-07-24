import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const handleLogoClick = () => {
    window.open("https://veridicuslab.com", "_blank"); // Opens in new tab
    // OR
    // window.location.href = 'https://your-website.com'; // Same tab
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/Veridicus.svg"
                  alt="Dev Utilities Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white hidden sm:block">
                DevutiliX
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* <a
              href="https://github.com/nirdhum"
              target="_blank"
              rel="noopener noreferrer"
              className="
                p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none
              "
              aria-label="View on GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
