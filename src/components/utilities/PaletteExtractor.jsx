"use client";

import { useState, useEffect, useRef } from "react";

// Preloaded sample images (Canvas generated SVGs)
const SAMPLES = [
  {
    name: "Sunset Waves",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%231e1b4b'/><circle cx='200' cy='180' r='110' fill='%23f43f5e'/><circle cx='200' cy='220' r='90' fill='%23fb923c'/><circle cx='200' cy='260' r='80' fill='%23fde047'/></svg>",
  },
  {
    name: "Emerald Forest",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%23064e3b'/><circle cx='120' cy='150' r='100' fill='%23059669'/><circle cx='280' cy='180' r='120' fill='%2334d399'/><circle cx='200' cy='80' r='60' fill='%23a7f3d0'/></svg>",
  },
  {
    name: "Neon Cyberpunk",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%230f172a'/><circle cx='100' cy='120' r='90' fill='%238b5cf6'/><circle cx='280' cy='160' r='110' fill='%2306b6d4'/><circle cx='200' cy='240' r='70' fill='%23f472b6'/></svg>",
  },
];

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function PaletteExtractor() {
  const [imageSrc, setImageSrc] = useState(SAMPLES[0].src);
  const [palette, setPalette] = useState([]);
  const [copiedKey, setCopiedKey] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Extract color palette from imageSrc using HTML5 Canvas
  useEffect(() => {
    let isCancelled = false;
    setIsExtracting(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const size = 64; // Downscale to 64x64 for non-blocking analysis
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size).data;
      const buckets = {};
      let totalPixels = 0;

      // Group into 5-bit color buckets (32 levels per channel)
      for (let i = 0; i < imgData.length; i += 4) {
        const a = imgData[i + 3];
        if (a < 128) continue; // Skip transparent

        // Quantize
        const r = Math.round(imgData[i] / 16) * 16;
        const g = Math.round(imgData[i + 1] / 16) * 16;
        const b = Math.round(imgData[i + 2] / 16) * 16;
        const key = `${r},${g},${b}`;

        buckets[key] = (buckets[key] || 0) + 1;
        totalPixels++;
      }

      // Sort by frequency
      const sortedKeys = Object.keys(buckets).sort(
        (a, b) => buckets[b] - buckets[a]
      );

      // Select top 6 distinct colors
      const extracted = [];
      for (const k of sortedKeys) {
        const [r, g, b] = k.split(",").map(Number);
        // Ensure distinctness
        const isDuplicate = extracted.some((item) => {
          const dist = Math.sqrt(
            Math.pow(item.r - r, 2) +
            Math.pow(item.g - g, 2) +
            Math.pow(item.b - b, 2)
          );
          return dist < 45;
        });

        if (!isDuplicate) {
          const hex = rgbToHex(r, g, b);
          const hsl = rgbToHsl(r, g, b);
          const percent = ((buckets[k] / totalPixels) * 100).toFixed(1);
          extracted.push({ hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl, r, g, b, percent });
          if (extracted.length >= 6) break;
        }
      }

      setPalette(extracted);
      setIsExtracting(false);
    };

    img.src = imageSrc;

    return () => {
      isCancelled = true;
    };
  }, [imageSrc]);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const cssVariables = `:root {\n${palette
    .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
    .join("\n")}\n}`;

  const tailwindExport = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${palette
    .map((c, i) => `        palette${i + 1}: '${c.hex}',`)
    .join("\n")}\n      }\n    }\n  }\n};`;

  const jsonExport = JSON.stringify(palette.map((c) => c.hex), null, 2);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Color Palette Extractor from Image</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                HTML5 Canvas (100% Client-Side)
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Extract harmonious, dominant color palettes from any photo or graphic with zero server upload.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        {/* Preset Thumbnails */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Sample Images:
          </span>
          {SAMPLES.map((s) => (
            <button
              key={s.name}
              onClick={() => setImageSrc(s.src)}
              className="px-3 py-1 text-xs font-semibold rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Image Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
            Analyzed Image
          </span>
          <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Analyzed via pixel-clustering quantization in browser memory.
          </p>
        </div>

        {/* Extracted Swatches & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Dominant Palette ({palette.length} Colors)
              </span>
              {isExtracting && (
                <span className="text-xs text-blue-500 font-semibold animate-pulse">
                  Extracting...
                </span>
              )}
            </div>

            {/* Continuous Palette Bar */}
            <div className="w-full h-12 rounded-xl overflow-hidden flex shadow-inner border border-gray-200 dark:border-gray-700">
              {palette.map((c, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: c.hex, width: `${100 / palette.length}%` }}
                  className="h-full transition-transform hover:scale-105 cursor-pointer relative group"
                  onClick={() => handleCopy(c.hex, `swatch_${i}`)}
                  title={`Click to copy ${c.hex}`}
                />
              ))}
            </div>

            {/* Individual Swatch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {palette.map((c, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-black/10 shadow-sm shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <span className="font-mono font-bold text-gray-900 dark:text-white block">
                        {c.hex}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {c.rgb}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(c.hex, `hex_${i}`)}
                    className="px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                  >
                    {copiedKey === `hex_${i}` ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Code Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleCopy(cssVariables, "css_var")}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer shadow-sm"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Export CSS
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {copiedKey === "css_var" ? "✓ Copied Variables" : "Copy CSS Variables"}
              </span>
            </button>

            <button
              onClick={() => handleCopy(tailwindExport, "tw_cfg")}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer shadow-sm"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Export Tailwind
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {copiedKey === "tw_cfg" ? "✓ Copied Config" : "Copy Tailwind Config"}
              </span>
            </button>

            <button
              onClick={() => handleCopy(jsonExport, "json_arr")}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-xl text-left transition-all cursor-pointer shadow-sm"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Export Array
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {copiedKey === "json_arr" ? "✓ Copied Array" : "Copy JSON Array"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
