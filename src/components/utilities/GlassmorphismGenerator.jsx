"use client";

import { useState, useMemo } from "react";

const BG_PRESETS = [
  {
    name: "Sunset Vibrant",
    class: "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500",
  },
  {
    name: "Ocean Glow",
    class: "bg-gradient-to-tr from-blue-600 via-teal-500 to-indigo-900",
  },
  {
    name: "Cyberpunk Neon",
    class: "bg-gradient-to-tr from-purple-900 via-indigo-800 to-pink-600",
  },
  {
    name: "Emerald Forest",
    class: "bg-gradient-to-tr from-emerald-800 via-green-600 to-teal-400",
  },
];

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(16);
  const [opacity, setOpacity] = useState(0.25);
  const [colorMode, setColorMode] = useState("white"); // white | black | custom
  const [customHex, setCustomHex] = useState("#FFFFFF");
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderOpacity, setBorderOpacity] = useState(0.3);
  const [borderRadius, setBorderRadius] = useState(20);
  const [shadowBlur, setShadowBlur] = useState(32);
  const [shadowY, setShadowY] = useState(8);
  const [shadowOpacity, setShadowOpacity] = useState(0.35);
  const [bgPresetIndex, setBgPresetIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState("");

  const glassStyle = useMemo(() => {
    let r = 255, g = 255, b = 255;
    if (colorMode === "black") {
      r = 0; g = 0; b = 0;
    } else if (colorMode === "custom") {
      const clean = customHex.replace("#", "");
      if (clean.length === 6) {
        r = parseInt(clean.slice(0, 2), 16) || 255;
        g = parseInt(clean.slice(2, 4), 16) || 255;
        b = parseInt(clean.slice(4, 6), 16) || 255;
      }
    }

    const bgRgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    const borderRgba = `rgba(${r}, ${g}, ${b}, ${borderOpacity})`;
    const shadowRgba = `rgba(0, 0, 0, ${shadowOpacity})`;

    return {
      background: bgRgba,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderRadius: `${borderRadius}px`,
      border: `${borderWidth}px solid ${borderRgba}`,
      boxShadow: `0 ${shadowY}px ${shadowBlur}px 0 ${shadowRgba}`,
    };
  }, [blur, opacity, colorMode, customHex, borderWidth, borderOpacity, borderRadius, shadowBlur, shadowY, shadowOpacity]);

  const cssCode = useMemo(() => {
    return `/* Glassmorphism CSS */
background: ${glassStyle.background};
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${borderRadius}px;
border: ${borderWidth}px solid ${glassStyle.border ? glassStyle.border.split("solid ")[1] : "rgba(255,255,255,0.3)"};
box-shadow: ${glassStyle.boxShadow};`;
  }, [glassStyle, blur, borderRadius, borderWidth]);

  const tailwindCode = useMemo(() => {
    const bgClass = colorMode === "black" ? `bg-black/${Math.round(opacity * 100)}` : `bg-white/${Math.round(opacity * 100)}`;
    const blurClass = blur >= 24 ? "backdrop-blur-xl" : blur >= 16 ? "backdrop-blur-md" : "backdrop-blur-sm";
    const borderClass = `border border-white/${Math.round(borderOpacity * 100)}`;
    const radiusClass = borderRadius >= 24 ? "rounded-3xl" : borderRadius >= 16 ? "rounded-2xl" : "rounded-lg";
    return `${bgClass} ${blurClass} ${radiusClass} ${borderClass} shadow-xl`;
  }, [colorMode, opacity, blur, borderOpacity, borderRadius]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>CSS Glassmorphism & Shadow Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Vanilla CSS + Tailwind
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Design modern frosted-glass cards, multi-layer blur filters, and atmospheric box shadows.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4 max-h-[640px] overflow-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Glass Parameters
          </h2>

          {/* Color Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Surface Tint
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
              {["white", "black", "custom"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setColorMode(mode)}
                  className={`flex-1 py-1.5 capitalize transition-colors cursor-pointer ${
                    colorMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {colorMode === "custom" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="flex-1 px-3 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Backdrop Blur */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span>Backdrop Blur</span>
              <span className="font-mono text-gray-400">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={blur}
              onChange={(e) => setBlur(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span>Surface Opacity</span>
              <span className="font-mono text-gray-400">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Border Width & Opacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Border Width</span>
                <span className="font-mono text-gray-400">{borderWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Border Opacity</span>
                <span className="font-mono text-gray-400">{Math.round(borderOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={borderOpacity}
                onChange={(e) => setBorderOpacity(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span>Corner Radius</span>
              <span className="font-mono text-gray-400">{borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              value={borderRadius}
              onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Shadow Controls */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
              Shadow Elevation
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Shadow Blur</span>
                  <span className="font-mono">{shadowBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="64"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Shadow Opacity</span>
                  <span className="font-mono">{Math.round(shadowOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={shadowOpacity}
                  onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Background switcher bar */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <span className="text-gray-500">Preview Backdrop:</span>
            <div className="flex gap-1.5">
              {BG_PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => setBgPresetIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    bgPresetIndex === idx
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Backdrop Canvas */}
          <div
            className={`relative w-full h-80 rounded-2xl p-6 flex items-center justify-center overflow-hidden shadow-inner ${BG_PRESETS[bgPresetIndex].class}`}
          >
            {/* Background floating decor circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-400/40 rounded-full filter blur-xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-yellow-300/40 rounded-full filter blur-xl" />

            {/* Glass Card */}
            <div
              style={glassStyle}
              className="relative z-10 w-full max-w-sm p-6 text-white transition-all select-none cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Frosted Glass
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h3 className="text-lg font-bold drop-shadow-sm mb-1">
                Glassmorphism Card
              </h3>
              <p className="text-xs text-white/90 leading-relaxed drop-shadow-sm mb-4">
                Dynamic real-time blur and specular highlight reflection. Works over images and color gradients.
              </p>
              <div className="flex items-center justify-between text-xs border-t border-white/20 pt-3">
                <span className="font-mono text-[11px] text-white/80">DevutiliX Glass UI</span>
                <button className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition-colors">
                  Explore
                </button>
              </div>
            </div>
          </div>

          {/* Generated Code Boxes */}
          <div className="space-y-3">
            {/* CSS Output */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Vanilla CSS
                </span>
                <button
                  onClick={() => handleCopy(cssCode, "css")}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {copiedKey === "css" ? "✓ Copied" : "Copy CSS"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-cyan-300 font-mono text-xs rounded-lg overflow-auto leading-relaxed max-h-36">
                {cssCode}
              </pre>
            </div>

            {/* Tailwind Output */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Tailwind CSS Classes
                </span>
                <button
                  onClick={() => handleCopy(tailwindCode, "tw")}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {copiedKey === "tw" ? "✓ Copied" : "Copy Tailwind"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-amber-300 font-mono text-xs rounded-lg overflow-auto leading-relaxed">
                {tailwindCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
