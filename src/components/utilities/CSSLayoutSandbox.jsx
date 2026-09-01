"use client";

import { useState, useMemo } from "react";

export default function CSSLayoutSandbox() {
  const [layoutMode, setLayoutMode] = useState("flex"); // flex | grid

  // Flexbox Properties
  const [flexDirection, setFlexDirection] = useState("row");
  const [justifyContent, setJustifyContent] = useState("center");
  const [alignItems, setAlignItems] = useState("center");
  const [flexWrap, setFlexWrap] = useState("wrap");
  const [flexGap, setFlexGap] = useState(16);

  // Grid Properties
  const [gridColumns, setGridColumns] = useState("repeat(3, 1fr)");
  const [gridGap, setGridGap] = useState(16);
  const [justifyItems, setJustifyItems] = useState("stretch");
  const [gridAlignItems, setGridAlignItems] = useState("stretch");

  // Items
  const [itemsCount, setItemsCount] = useState(5);
  const [selectedItemIdx, setSelectedItemIdx] = useState(null);
  const [itemGrow, setItemGrow] = useState({});
  const [copiedKey, setCopiedKey] = useState("");

  const containerStyle = useMemo(() => {
    if (layoutMode === "flex") {
      return {
        display: "flex",
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap: `${flexGap}px`,
      };
    } else {
      return {
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: `${gridGap}px`,
        justifyItems,
        alignItems: gridAlignItems,
      };
    }
  }, [
    layoutMode,
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    flexGap,
    gridColumns,
    gridGap,
    justifyItems,
    gridAlignItems,
  ]);

  const cssCode = useMemo(() => {
    if (layoutMode === "flex") {
      return `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${flexGap}px;
}`;
    } else {
      return `.container {
  display: grid;
  grid-template-columns: ${gridColumns};
  gap: ${gridGap}px;
  justify-items: ${justifyItems};
  align-items: ${gridAlignItems};
}`;
    }
  }, [
    layoutMode,
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    flexGap,
    gridColumns,
    gridGap,
    justifyItems,
    gridAlignItems,
  ]);

  const tailwindCode = useMemo(() => {
    if (layoutMode === "flex") {
      const dirMap = { row: "flex-row", "row-reverse": "flex-row-reverse", column: "flex-col", "column-reverse": "flex-col-reverse" };
      const jMap = { "flex-start": "justify-start", center: "justify-center", "flex-end": "justify-end", "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly" };
      const aMap = { stretch: "items-stretch", "flex-start": "items-start", center: "items-center", "flex-end": "items-end", baseline: "items-baseline" };
      const wMap = { nowrap: "flex-nowrap", wrap: "flex-wrap", "wrap-reverse": "flex-wrap-reverse" };
      return `flex ${dirMap[flexDirection] || ""} ${jMap[justifyContent] || ""} ${aMap[alignItems] || ""} ${wMap[flexWrap] || ""} gap-[${flexGap}px]`;
    } else {
      return `grid gap-[${gridGap}px]`;
    }
  }, [layoutMode, flexDirection, justifyContent, alignItems, flexWrap, flexGap, gridGap]);

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
              <span>CSS Flexbox & Grid Visual Sandbox</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Interactive Layout Engine
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualize alignment, distribution, wrap, and gap mechanics with live Vanilla CSS and Tailwind exports.
            </p>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setLayoutMode("flex")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                layoutMode === "flex"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              Flexbox
            </button>
            <button
              onClick={() => setLayoutMode("grid")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                layoutMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              CSS Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4 max-h-[640px] overflow-auto">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {layoutMode === "flex" ? "Flex Container Settings" : "Grid Container Settings"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setItemsCount((c) => Math.max(1, c - 1))}
                className="px-2 py-0.5 text-xs font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded cursor-pointer"
                title="Remove Item"
              >
                -
              </button>
              <span className="text-xs font-mono text-gray-500">{itemsCount} items</span>
              <button
                onClick={() => setItemsCount((c) => Math.min(12, c + 1))}
                className="px-2 py-0.5 text-xs font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded cursor-pointer"
                title="Add Item"
              >
                +
              </button>
            </div>
          </div>

          {layoutMode === "flex" ? (
            /* Flexbox Controls */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  flex-direction
                </label>
                <select
                  value={flexDirection}
                  onChange={(e) => setFlexDirection(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="row">row (default)</option>
                  <option value="row-reverse">row-reverse</option>
                  <option value="column">column</option>
                  <option value="column-reverse">column-reverse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  justify-content (Main Axis)
                </label>
                <select
                  value={justifyContent}
                  onChange={(e) => setJustifyContent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                  <option value="space-evenly">space-evenly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  align-items (Cross Axis)
                </label>
                <select
                  value={alignItems}
                  onChange={(e) => setAlignItems(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="stretch">stretch</option>
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="baseline">baseline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  flex-wrap
                </label>
                <select
                  value={flexWrap}
                  onChange={(e) => setFlexWrap(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="nowrap">nowrap</option>
                  <option value="wrap">wrap</option>
                  <option value="wrap-reverse">wrap-reverse</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <span>gap</span>
                  <span className="font-mono text-gray-400">{flexGap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={flexGap}
                  onChange={(e) => setFlexGap(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            /* Grid Controls */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  grid-template-columns
                </label>
                <select
                  value={gridColumns}
                  onChange={(e) => setGridColumns(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="repeat(3, 1fr)">repeat(3, 1fr)</option>
                  <option value="repeat(2, 1fr)">repeat(2, 1fr)</option>
                  <option value="repeat(4, 1fr)">repeat(4, 1fr)</option>
                  <option value="repeat(auto-fit, minmax(100px, 1fr))">repeat(auto-fit, minmax(100px, 1fr))</option>
                  <option value="1fr 2fr 1fr">1fr 2fr 1fr</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <span>gap</span>
                  <span className="font-mono text-gray-400">{gridGap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={gridGap}
                  onChange={(e) => setGridGap(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  justify-items (Inline Axis)
                </label>
                <select
                  value={justifyItems}
                  onChange={(e) => setJustifyItems(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="stretch">stretch</option>
                  <option value="start">start</option>
                  <option value="center">center</option>
                  <option value="end">end</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  align-items (Block Axis)
                </label>
                <select
                  value={gridAlignItems}
                  onChange={(e) => setGridAlignItems(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="stretch">stretch</option>
                  <option value="start">start</option>
                  <option value="center">center</option>
                  <option value="end">end</option>
                </select>
              </div>
            </div>
          )}

          {/* Item override section if selected */}
          {selectedItemIdx !== null && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                <span>Selected Item #{selectedItemIdx + 1}</span>
                <button
                  onClick={() => setSelectedItemIdx(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Deselect
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>flex-grow: {itemGrow[selectedItemIdx] || 0}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => setItemGrow({ ...itemGrow, [selectedItemIdx]: val })}
                      className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                        (itemGrow[selectedItemIdx] || 0) === val
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Canvas & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Interactive Layout Viewport */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 mb-3 text-xs text-gray-500 font-semibold">
              <span>Layout Viewport (Click item to select)</span>
              <span className="font-mono text-[11px] uppercase">
                {layoutMode}
              </span>
            </div>

            <div
              style={containerStyle}
              className="w-full min-h-[300px] p-4 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl transition-all overflow-auto"
            >
              {Array.from({ length: itemsCount }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItemIdx(idx === selectedItemIdx ? null : idx)}
                  style={{
                    flexGrow: itemGrow[idx] || 0,
                  }}
                  className={`min-w-[70px] min-h-[70px] p-3 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer select-none shadow-sm ${
                    selectedItemIdx === idx
                      ? "ring-2 ring-blue-500 bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-400"
                  }`}
                >
                  <span className="text-base font-black">#{idx + 1}</span>
                  {(itemGrow[idx] || 0) > 0 && (
                    <span className="text-[10px] opacity-80">grow: {itemGrow[idx]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-3">
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
              <pre className="p-3 bg-gray-900 text-cyan-300 font-mono text-xs rounded-lg overflow-auto leading-relaxed">
                {cssCode}
              </pre>
            </div>

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
