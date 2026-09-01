"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavorites } from "../../context/FavoritesContext";
import { ShareIcon, StarIcon, ShieldCheckIcon } from "./Icons";

export default function WorkspaceHeader({ utility, isWide, onToggleWide }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copiedLink, setCopiedLink] = useState(false);
  const starred = isFavorite(utility.id);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-gray-200 dark:border-gray-800">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400 min-w-0">
          <Link
            href="/"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
          >
            Tools
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300 font-bold shrink-0">
            {utility.category}
          </span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 truncate max-w-[120px] sm:max-w-[220px]">
            {utility.title}
          </span>
        </nav>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
          {/* Wide mode toggle (Visible on tablet & desktop) */}
          <button
            onClick={onToggleWide}
            className={`hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl border font-semibold items-center gap-1.5 transition-all cursor-pointer ${
              isWide
                ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            }`}
            title={isWide ? "Standard Width" : "Expand Fullscreen Canvas"}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isWide ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
            <span>{isWide ? "Standard" : "Wide Canvas"}</span>
          </button>

          {/* Share link button */}
          <button
            onClick={handleCopyShareLink}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Share this tool"
          >
            <ShareIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share"}</span>
          </button>

          {/* Star / Pin toggle */}
          <button
            onClick={() => toggleFavorite(utility.id)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              starred
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            }`}
            title={starred ? "Remove from Pinned" : "Pin to Favorites"}
          >
            <StarIcon
              filled={starred}
              className={`w-3.5 h-3.5 ${starred ? "text-amber-500" : "text-gray-400"}`}
            />
            <span className="hidden sm:inline">{starred ? "Pinned" : "Pin"}</span>
          </button>
        </div>
      </div>

      {/* Tool Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {utility.title}
            </h1>
            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">
              {utility.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
            {utility.description}
          </p>
        </div>

        {/* Security & Privacy Pills */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            100% Client-Side
          </span>
          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            Zero Server Calls
          </span>
        </div>
      </div>
    </div>
  );
}
