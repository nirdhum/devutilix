import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleLogoClick = () => {
    window.open("https://veridicuslab.com", "_blank");
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      // Closing animation
      setIsMenuVisible(false);
      setTimeout(() => setIsMobileMenuOpen(false), 300); // Wait for animation to complete
    } else {
      // Opening animation
      setIsMobileMenuOpen(true);
      setTimeout(() => setIsMenuVisible(true), 10); // Small delay to ensure DOM is ready
    }
  };

  const closeMobileMenu = () => {
    setIsMenuVisible(false);
    setTimeout(() => setIsMobileMenuOpen(false), 300);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        closeMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
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

            <div className="flex items-center space-x-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === "/"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Utilities
                </Link>
                <Link
                  to="/about"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === "/about"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  About
                </Link>
              </nav>

              <ThemeToggle />

              {/* Mobile Menu Button with Icon Animation */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isMenuVisible ? "rotate-90" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuVisible ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop with smooth fade */}
          <div
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
              isMenuVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobileMenu}
          />

          {/* Slide-out Menu with smooth slide and fade */}
          <div
            className={`mobile-menu-container fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out ${
              isMenuVisible
                ? "transform translate-x-0 opacity-100"
                : "transform translate-x-full opacity-95"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                DevutiliX
              </h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
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

            {/* Navigation with staggered animation */}
            <nav className="p-4 space-y-2">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  location.pathname === "/"
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
                } ${
                  isMenuVisible
                    ? "transform translate-x-0 opacity-100"
                    : "transform translate-x-4 opacity-0"
                } transition-all duration-300 delay-75`}
                style={{
                  transitionDelay: isMenuVisible ? "75ms" : "0ms",
                }}
              >
                <span className="text-xl">🛠️</span>
                <span className="font-medium">Utilities</span>
              </Link>

              <Link
                to="/about"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  location.pathname === "/about"
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
                } ${
                  isMenuVisible
                    ? "transform translate-x-0 opacity-100"
                    : "transform translate-x-4 opacity-0"
                } transition-all duration-300 delay-150`}
                style={{
                  transitionDelay: isMenuVisible ? "150ms" : "0ms",
                }}
              >
                <span className="text-xl">ℹ️</span>
                <span className="font-medium">About</span>
              </Link>

              {/* Optional: Add a divider and extra info */}
              <div
                className={`pt-4 mt-4 border-t border-gray-200 dark:border-gray-600 ${
                  isMenuVisible
                    ? "transform translate-x-0 opacity-100"
                    : "transform translate-x-4 opacity-0"
                } transition-all duration-300 delay-200`}
              >
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>31 Developer Utilities</p>
                  <p className="mt-1">Built with ❤️ for developers</p>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
