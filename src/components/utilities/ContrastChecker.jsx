"use client";

import { useState, useMemo } from "react";

// Convert hex to rgb
function hexToRgb(hex) {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate relative luminance per WCAG 2.1
function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio
function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const PRESETS = [
  { name: "Default Dark", fg: "#F8FAFC", bg: "#0F172A" },
  { name: "GitHub Clean", fg: "#1F2328", bg: "#FFFFFF" },
  { name: "High Contrast", fg: "#FFFF00", bg: "#000000" },
  { name: "Slate & Cyan", fg: "#06B6D4", bg: "#0F172A" },
  { name: "Modern Amber", fg: "#78350F", bg: "#FEF3C7" },
  { name: "Subtle Violet", fg: "#6D28D9", bg: "#F5F3FF" },
];

export default function ContrastChecker() {
  const [fgColor, setFgColor] = useState("#F8FAFC");
  const [bgColor, setBgColor] = useState("#0F172A");

  const ratio = useMemo(() => {
    return getContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const formattedRatio = ratio.toFixed(2);

  // WCAG Criteria:
  // Normal Text: AA >= 4.5, AAA >= 7.0
  // Large Text (18pt+ or 14pt bold): AA >= 3.0, AAA >= 4.5
  // UI Components: AA >= 3.0
  const passNormalAA = ratio >= 4.5;
  const passNormalAAA = ratio >= 7.0;
  const passLargeAA = ratio >= 3.0;
  const passLargeAAA = ratio >= 4.5;
  const passUiComponents = ratio >= 3.0;

  const handleSwap = () => {
    setFgColor(bgColor);
    setBgColor(fgColor);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>WCAG Contrast & Accessibility Checker</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                WCAG 2.1 Compliant
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Verify color contrast ratios for text and UI elements against WCAG AA and AAA accessibility standards.
            </p>
          </div>

          <button
            onClick={handleSwap}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            ⇄ Swap Colors
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setFgColor(p.fg);
                setBgColor(p.bg);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span
                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: p.bg }}
              />
              <span
                className="w-3 h-3 rounded-full -ml-2.5 border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: p.fg }}
              />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Pickers & Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Color Pickers (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Color Selection
          </h2>

          {/* Foreground */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Foreground / Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor.startsWith("#") && fgColor.length === 7 ? fgColor : "#000000"}
                onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                placeholder="#F8FAFC"
                className="flex-1 px-3 py-2 text-sm font-mono uppercase bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor.startsWith("#") && bgColor.length === 7 ? bgColor : "#FFFFFF"}
                onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#0F172A"
                className="flex-1 px-3 py-2 text-sm font-mono uppercase bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Big Ratio Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Contrast Ratio
            </span>
            <div className="text-3xl font-extrabold font-mono text-gray-900 dark:text-white">
              {formattedRatio} : 1
            </div>
            <p className="text-[11px] text-gray-500">
              {ratio >= 7
                ? "Excellent contrast (Passes all levels)"
                : ratio >= 4.5
                ? "Good contrast (Passes AA standards)"
                : ratio >= 3.0
                ? "Fair contrast (Passes large text only)"
                : "Poor contrast (Fails accessibility)"}
            </p>
          </div>
        </div>

        {/* Compliance Badges & Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Criteria Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block pb-2 border-b border-gray-100 dark:border-gray-700">
              WCAG 2.1 Compliance Results
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Normal Text AA */}
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">Normal Text (AA)</span>
                  <span className="text-[10px] text-gray-500">Minimum 4.5:1</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    passNormalAA
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {passNormalAA ? "✓ Pass" : "✕ Fail"}
                </span>
              </div>

              {/* Normal Text AAA */}
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">Normal Text (AAA)</span>
                  <span className="text-[10px] text-gray-500">Enhanced 7.0:1</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    passNormalAAA
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {passNormalAAA ? "✓ Pass" : "✕ Fail"}
                </span>
              </div>

              {/* Large Text AA */}
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">Large Text (AA)</span>
                  <span className="text-[10px] text-gray-500">Minimum 3.0:1 (18pt+)</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    passLargeAA
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {passLargeAA ? "✓ Pass" : "✕ Fail"}
                </span>
              </div>

              {/* Large Text AAA */}
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">Large Text (AAA)</span>
                  <span className="text-[10px] text-gray-500">Enhanced 4.5:1</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    passLargeAAA
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {passLargeAAA ? "✓ Pass" : "✕ Fail"}
                </span>
              </div>

              {/* UI Components */}
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-gray-800 dark:text-gray-200">UI Components & Icons</span>
                  <span className="text-[10px] text-gray-500">Minimum 3.0:1 for borders, buttons & controls</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    passUiComponents
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {passUiComponents ? "✓ Pass" : "✕ Fail"}
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Canvas */}
          <div
            className="rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 transition-colors"
            style={{ backgroundColor: bgColor, color: fgColor }}
          >
            <span className="text-xs font-mono uppercase tracking-widest opacity-60">
              Live Preview Container
            </span>
            <h3 className="text-2xl font-bold tracking-tight">
              Accessible Headline (Large Text)
            </h3>
            <p className="text-sm leading-relaxed opacity-90">
              This paragraph demonstrates regular body text rendering in your chosen color scheme. Ensure all users, including those with visual impairments, can read this without eye strain.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold border transition-transform active:scale-95 cursor-pointer"
                style={{
                  borderColor: fgColor,
                  color: bgColor,
                  backgroundColor: fgColor,
                }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold border transition-transform active:scale-95 cursor-pointer"
                style={{
                  borderColor: fgColor,
                  color: fgColor,
                  backgroundColor: "transparent",
                }}
              >
                Outline Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
