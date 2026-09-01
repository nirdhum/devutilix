"use client";

import { useState, useMemo } from "react";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were",
]);

function createSlug(text, { delimiter = "-", removeStopWords = false, maxLength = 0, toLower = true }) {
  if (!text) return "";

  // 1. Transliterate accented unicode characters
  let str = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o");

  if (toLower) {
    str = str.toLowerCase();
  }

  // 2. Remove special characters and symbols
  str = str.replace(/[^\w\s-]/g, "");

  // 3. Tokenize by whitespace and hyphens
  let words = str.trim().split(/[\s_-]+/);

  // 4. Remove stop words if enabled
  if (removeStopWords) {
    words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  }

  // 5. Join with delimiter
  let slug = words.join(delimiter);

  // 6. Truncate if maxLength set
  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
    // Don't cut off in the middle of delimiter
    const lastDelim = slug.lastIndexOf(delimiter);
    if (lastDelim > 10) {
      slug = slug.slice(0, lastDelim);
    }
  }

  return slug;
}

export default function SlugGenerator() {
  const [inputText, setInputText] = useState(
    "10 Best Next.js 15 Features & Tips for 2026! (A Developer's Guide)"
  );
  const [delimiter, setDelimiter] = useState("-");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [toLower, setToLower] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    return createSlug(inputText, {
      delimiter,
      removeStopWords,
      maxLength,
      toLower,
    });
  }, [inputText, delimiter, removeStopWords, maxLength, toLower]);

  const previewUrl = `https://example.com/blog/${slug || "your-slug"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>SEO URL Slug Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Unicode & Accent Safe
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Convert blog titles, headings, and product names into clean, readable, search-engine-friendly URL slugs.
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Separator:</span>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              {[
                { label: "Hyphen (-)", val: "-" },
                { label: "Underscore (_)", val: "_" },
                { label: "Slash (/)", val: "/" },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setDelimiter(s.val)}
                  className={`px-3 py-1 transition-colors cursor-pointer ${
                    delimiter === s.val
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeStopWords}
              onChange={(e) => setRemoveStopWords(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Remove Stop Words (a, the, in...)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={toLower}
              onChange={(e) => setToLower(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Lowercase Output</span>
          </label>
        </div>
      </div>

      {/* Input Textarea */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Source Title / Text
          </label>
          <span className="text-xs text-gray-400 font-mono">{inputText.length} characters</span>
        </div>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste your article title..."
          className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Generated Output Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Generated URL Slug
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              {copied ? (
                <span>Copied!</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Slug</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3.5 bg-gray-900 text-emerald-400 font-mono text-sm font-bold rounded-lg break-all">
            {slug || "..."}
          </div>
        </div>

        {/* Live URL Preview */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Browser URL Simulation
          </span>
          <div className="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
            {previewUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
