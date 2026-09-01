"use client";

import { useState, useMemo } from "react";

const PRESETS = [
  {
    name: "Hyper Sunset",
    type: "linear",
    angle: 90,
    stops: [
      { color: "#FF4E50", position: 0 },
      { color: "#F9D423", position: 100 },
    ],
  },
  {
    name: "Neon Cyber",
    type: "linear",
    angle: 135,
    stops: [
      { color: "#00F260", position: 0 },
      { color: "#0575E6", position: 100 },
    ],
  },
  {
    name: "Royal Violet",
    type: "linear",
    angle: 90,
    stops: [
      { color: "#8A2387", position: 0 },
      { color: "#E94057", position: 50 },
      { color: "#F27121", position: 100 },
    ],
  },
  {
    name: "Aurora Glow",
    type: "linear",
    angle: 120,
    stops: [
      { color: "#00C9FF", position: 0 },
      { color: "#92FE9D", position: 100 },
    ],
  },
  {
    name: "Midnight Deep",
    type: "linear",
    angle: 180,
    stops: [
      { color: "#0F2027", position: 0 },
      { color: "#203A43", position: 50 },
      { color: "#2C5364", position: 100 },
    ],
  },
  {
    name: "Emerald Stream",
    type: "linear",
    angle: 135,
    stops: [
      { color: "#0BA360", position: 0 },
      { color: "#3CBA92", position: 100 },
    ],
  },
];

export default function GradientGenerator() {
  const [gradientType, setGradientType] = useState("linear"); // linear | radial | conic
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState([
    { color: "#3B82F6", position: 0 },
    { color: "#8B5CF6", position: 50 },
    { color: "#EC4899", position: 100 },
  ]);
  const [copiedKey, setCopiedKey] = useState("");

  const gradientCSS = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (gradientType === "radial") {
      return `radial-gradient(circle at center, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${angle}deg at 50% 50%, ${stopsStr})`;
    }
  }, [gradientType, angle, stops]);

  const fullCSS = `background: ${gradientCSS};`;
  const tailwindClass = `bg-[${gradientCSS.replace(/\s+/g, "_")}]`;

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const newPos = Math.round((stops[0].position + stops[stops.length - 1].position) / 2);
    setStops([...stops, { color: "#10B981", position: newPos }]);
  };

  const handleRemoveStop = (index) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleUpdateStop = (index, key, value) => {
    const next = [...stops];
    next[index] = { ...next[index], [key]: value };
    setStops(next);
  };

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
              <span>CSS Gradient & Color Mesh Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Linear / Radial / Conic
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Craft multi-stop linear, radial, and conic gradients with instant Vanilla CSS and Tailwind exports.
            </p>
          </div>
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
                setGradientType(p.type);
                setAngle(p.angle);
                setStops(p.stops);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600"
                style={{
                  background: `linear-gradient(135deg, ${p.stops.map((s) => s.color).join(", ")})`,
                }}
              />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4 max-h-[640px] overflow-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Gradient Controls
          </h2>

          {/* Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Gradient Shape
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
              {["linear", "radial", "conic"].map((type) => (
                <button
                  key={type}
                  onClick={() => setGradientType(type)}
                  className={`flex-1 py-1.5 capitalize transition-colors cursor-pointer ${
                    gradientType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Angle Dial (for linear and conic) */}
          {gradientType !== "radial" && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Angle Orientation</span>
                <span className="font-mono text-gray-400">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          )}

          {/* Color Stops List */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Color Stops ({stops.length}/6)
              </span>
              {stops.length < 6 && (
                <button
                  onClick={handleAddStop}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer"
                >
                  + Add Stop
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {stops.map((stop, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 text-xs"
                >
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => handleUpdateStop(idx, "color", e.target.value.toUpperCase())}
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => handleUpdateStop(idx, "color", e.target.value)}
                    className="w-20 px-2 py-1 font-mono uppercase bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) =>
                        handleUpdateStop(idx, "position", parseInt(e.target.value, 10))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <span className="w-8 text-right font-mono text-[11px] text-gray-400">
                      {stop.position}%
                    </span>
                  </div>
                  {stops.length > 2 && (
                    <button
                      onClick={() => handleRemoveStop(idx)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer px-1 text-sm"
                      title="Remove Stop"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Gradient Preview Box */}
          <div
            style={{ background: gradientCSS }}
            className="w-full h-80 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg transition-all"
          >
            <div className="p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white max-w-sm shadow-xl">
              <h3 className="text-xl font-extrabold drop-shadow">
                Modern Visual Gradient
              </h3>
              <p className="text-xs text-white/90 mt-1 leading-relaxed drop-shadow-sm">
                Smooth color transition generated completely client-side in CSS3.
              </p>
            </div>
          </div>

          {/* Generated Code Boxes */}
          <div className="space-y-3">
            {/* Vanilla CSS */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Vanilla CSS
                </span>
                <button
                  onClick={() => handleCopy(fullCSS, "css")}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {copiedKey === "css" ? "✓ Copied" : "Copy CSS"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-cyan-300 font-mono text-xs rounded-lg overflow-auto leading-relaxed">
                {fullCSS}
              </pre>
            </div>

            {/* Tailwind Arbitrary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Tailwind CSS Class
                </span>
                <button
                  onClick={() => handleCopy(tailwindClass, "tw")}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {copiedKey === "tw" ? "✓ Copied" : "Copy Tailwind"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-amber-300 font-mono text-xs rounded-lg overflow-auto leading-relaxed break-all">
                {tailwindClass}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
