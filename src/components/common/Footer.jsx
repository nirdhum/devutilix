"use client";

import Link from "next/link";
import { utilities, categories } from "../../data/utilities";
import { useFavorites } from "../../context/FavoritesContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const totalUtilities = utilities.length;
  const totalCategories = categories.length;
  const { openCommandPalette } = useFavorites();

  return (
    <footer className="bg-white dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700/80 mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 space-y-6 sm:space-y-8">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-2.5 sm:space-y-3">
            <div className="flex items-center space-x-2">
              <img
                src="/devutilix_logo.svg"
                alt="DevutiliX Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                DevutiliX
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
              Fast, privacy-focused developer suite featuring {totalUtilities} essential offline tools. All transformations execute locally in your browser with zero data retention.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Client-Side Privacy
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-900 dark:text-white block mb-2 text-xs">
              Navigation
            </span>
            <div className="space-y-1.5 flex flex-col">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
              >
                All Developer Tools ({totalUtilities})
              </Link>
              <Link
                href="/about"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
              >
                About DevutiliX
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
              >
                Privacy Policy
              </Link>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
              >
                Sitemap (XML)
              </a>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
              >
                LLMs.txt (AI Spec)
              </a>
              <button
                onClick={openCommandPalette}
                className="text-left text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-0.5"
              >
                Command Palette (⌘K)
              </button>
            </div>
          </div>

          {/* Shortcuts & Links */}
          <div className="space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-900 dark:text-white block mb-2 text-xs">
              Keyboard Shortcuts
            </span>
            <div className="space-y-2 text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Quick Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px] border border-gray-200 dark:border-gray-600">
                  ⌘K / Ctrl+K
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Dismiss Modal</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px] border border-gray-200 dark:border-gray-600">
                  ESC
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
          <div>
            © {currentYear} DevutiliX. Crafted by{" "}
            <a
              href="https://nirdhum.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 dark:text-gray-200 hover:underline"
            >
              Nirdhum
            </a>{" "}
            at{" "}
            <a
              href="https://veridicuslab.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 dark:text-gray-200 hover:underline"
            >
              Veridicus Lab
            </a>
            .
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs">
            <a
              href="https://github.com/nirdhum/devutilix"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span>{totalCategories} Categories</span>
            <span>•</span>
            <span>{totalUtilities} Utilities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
