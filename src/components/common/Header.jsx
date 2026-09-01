"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { utilities } from "../../data/utilities";

import { useFavorites } from "../../context/FavoritesContext";
import { ToolsIcon, InfoIcon, LockClosedIcon, HeartIcon } from "./Icons";

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { openCommandPalette } = useFavorites();

  const totalUtilities = utilities.length;

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMenuVisible(false);
      setTimeout(() => setIsMobileMenuOpen(false), 300);
    } else {
      setIsMobileMenuOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsMenuVisible(true);
        });
      });
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
              <Link
                href="/"
                className="flex items-center space-x-2 group focus:outline-none"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src="/devutilix_logo.svg"
                    alt="DevutiliX Logo"
                    className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white hidden sm:block">
                  DevutiliX
                </h1>
              </Link>
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {totalUtilities} Tools
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Omnipresent Search Trigger Button */}
              <button
                onClick={openCommandPalette}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600/60 cursor-pointer transition-all shadow-xs"
                title="Search utilities (⌘K)"
              >
                <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline font-medium">Quick search...</span>
                <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-xs">
                  ⌘K
                </kbd>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${pathname === "/"
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  Utilities
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-medium transition-colors ${pathname === "/about"
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
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
                  className={`w-5 h-5 transition-transform duration-300 ${isMenuVisible ? "rotate-90" : "rotate-0"
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
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-out ${isMenuVisible ? "opacity-100" : "opacity-0"
              }`}
            onClick={closeMobileMenu}
          />

          {/* Slide-out Menu with smooth slide and fade */}
          <div
            className={`mobile-menu-container fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out ${isMenuVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
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

            {/* Mobile Search Button */}
            <div className="p-4 pb-0">
              <button
                onClick={() => {
                  closeMobileMenu();
                  openCommandPalette();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search 71 Tools...
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-[10px]">⌘K</kbd>
              </button>
            </div>

            {/* Navigation with staggered animation */}
            <nav className="p-4 space-y-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${pathname === "/"
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } transform transition-all duration-300 ease-out ${isMenuVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: isMenuVisible ? "100ms" : "0ms",
                }}
              >
                <ToolsIcon className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Utilities</span>
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${pathname === "/about"
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } transform transition-all duration-300 ease-out ${isMenuVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: isMenuVisible ? "200ms" : "0ms",
                }}
              >
                <InfoIcon className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">About</span>
              </Link>

              <Link
                href="/privacy"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${pathname === "/privacy"
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } transform transition-all duration-300 ease-out ${isMenuVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: isMenuVisible ? "250ms" : "0ms",
                }}
              >
                <LockClosedIcon className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Privacy Policy</span>
              </Link>

              <div
                className={`pt-4 mt-4 border-t border-gray-200 dark:border-gray-600 transform transition-all duration-300 ease-out ${isMenuVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: isMenuVisible ? "300ms" : "0ms",
                }}
              >
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>{totalUtilities} Developer Utilities</p>
                  <p className="mt-1 flex items-center justify-center gap-1">
                    <span>Built with</span>
                    <HeartIcon className="w-3.5 h-3.5 text-rose-500 inline" />
                    <span>for developers</span>
                  </p>
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
