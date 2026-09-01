"use client";

import { useState, useMemo, useRef } from "react";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100" width="100" height="100">
  <!-- Generator: Antigravity IDE Vector Tool -->
  <metadata id="metadata1">
    <inkscape:version>1.2.1</inkscape:version>
  </metadata>
  <g id="layer1">
    <circle cx="50.123456" cy="50.987654" r="40.555555" fill="#3B82F6" stroke="#1D4ED8" stroke-width="4.000000" />
    <path d="M 30.123456 50.654321 L 45.987654 65.432109 L 70.112233 35.889911" fill="none" stroke="#FFFFFF" stroke-width="6.234567" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

export default function SVGOptimizer() {
  const [rawSvg, setRawSvg] = useState(SAMPLE_SVG);
  const [stripComments, setStripComments] = useState(true);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [roundDecimals, setRoundDecimals] = useState(true);
  const [removeEmptyGroups, setRemoveEmptyGroups] = useState(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [copiedKey, setCopiedKey] = useState("");
  const fileInputRef = useRef(null);

  // SVG Optimizer Engine
  const optimizedSvg = useMemo(() => {
    let svg = rawSvg.trim();
    if (!svg) return "";

    // 1. Remove XML declaration and DOCTYPE
    svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, "");
    svg = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, "");

    // 2. Remove comments
    if (stripComments) {
      svg = svg.replace(/<!--[\s\S]*?-->/g, "");
    }

    // 3. Remove metadata, sodipodi, inkscape tags
    if (stripMetadata) {
      svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
      svg = svg.replace(/\s*(?:inkscape|sodipodi):[a-z0-9_-]+="[^"]*"/gi, "");
      svg = svg.replace(/\s*xmlns:(?:inkscape|sodipodi)="[^"]*"/gi, "");
    }

    // 4. Round decimal numbers in attributes (coordinates, stroke-width, path data)
    if (roundDecimals) {
      svg = svg.replace(/(\d+\.\d{3,})/g, (match) => {
        return parseFloat(match).toFixed(2).replace(/\.?0+$/, "");
      });
    }

    // 5. Remove empty groups
    if (removeEmptyGroups) {
      svg = svg.replace(/<g\s*[^>]*>\s*<\/g>/gi, "");
      svg = svg.replace(/<defs\s*[^>]*>\s*<\/defs>/gi, "");
    }

    // 6. Collapse whitespace
    if (collapseWhitespace) {
      svg = svg.replace(/\s{2,}/g, " ");
      svg = svg.replace(/>\s+</g, "><");
    }

    return svg.trim();
  }, [
    rawSvg,
    stripComments,
    stripMetadata,
    roundDecimals,
    removeEmptyGroups,
    collapseWhitespace,
  ]);

  const originalSize = new Blob([rawSvg]).size;
  const optimizedSize = new Blob([optimizedSvg]).size;
  const savings =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
      : 0;

  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(optimizedSvg)}`;

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawSvg(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>SVG Path Visualizer & Optimizer</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side Minifier
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Inspect SVG rendering, strip bloated editor metadata, round float coordinates, and minimize file size.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Load SVG</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download .svg</span>
            </button>
          </div>
        </div>

        {/* Compression Stat Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Original Size</span>
            <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
              {originalSize.toLocaleString()} bytes
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Optimized Size</span>
            <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
              {optimizedSize.toLocaleString()} bytes
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Byte Reduction</span>
            <span className="text-sm font-mono font-bold text-green-600 dark:text-green-400">
              -{savings}% ({originalSize - optimizedSize} bytes saved)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor & Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Optimization Flags
          </h2>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Strip XML Comments &lt;!-- --&gt;
              </span>
              <input
                type="checkbox"
                checked={stripComments}
                onChange={(e) => setStripComments(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Remove Illustrator / Inkscape Metadata
              </span>
              <input
                type="checkbox"
                checked={stripMetadata}
                onChange={(e) => setStripMetadata(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Round Decimal Coordinates (2 decimals)
              </span>
              <input
                type="checkbox"
                checked={roundDecimals}
                onChange={(e) => setRoundDecimals(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Remove Empty Groups (&lt;g&gt;&lt;/g&gt;)
              </span>
              <input
                type="checkbox"
                checked={removeEmptyGroups}
                onChange={(e) => setRemoveEmptyGroups(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Collapse Redundant Whitespace
              </span>
              <input
                type="checkbox"
                checked={collapseWhitespace}
                onChange={(e) => setCollapseWhitespace(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-1.5">
              Raw SVG Input
            </span>
            <textarea
              rows={8}
              value={rawSvg}
              onChange={(e) => setRawSvg(e.target.value)}
              placeholder="Paste <svg>...</svg> code..."
              className="w-full p-2.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            />
          </div>
        </div>

        {/* Live Preview & Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Visualizer Viewport */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold">
              <span className="text-gray-700 dark:text-gray-300">Live Visualizer</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold"
                >
                  -
                </button>
                <span className="font-mono text-[11px] text-gray-400">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Checkered Canvas */}
            <div className="w-full h-64 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center overflow-auto p-4">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                className="transition-transform max-w-full max-h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: optimizedSvg }}
              />
            </div>
          </div>

          {/* Optimized Output Box */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Optimized SVG Markup
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(dataUri, "uri")}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {copiedKey === "uri" ? "✓ Copied" : "Copy Data URI"}
                </button>
                <button
                  onClick={() => handleCopy(optimizedSvg, "svg")}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {copiedKey === "svg" ? "✓ Copied!" : "Copy SVG"}
                </button>
              </div>
            </div>

            <pre className="w-full p-3 bg-gray-900 text-green-400 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-48 break-all select-all">
              {optimizedSvg}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
