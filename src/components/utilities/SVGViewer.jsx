import { useState, useRef } from "react";

const SVGViewer = () => {
  const [svgCode, setSvgCode] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // split, code, preview
  const [optimizedCode, setOptimizedCode] = useState("");
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateSVG = (svgString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");

      if (parserError) {
        throw new Error("Invalid SVG syntax");
      }

      const svgElement = doc.querySelector("svg");
      if (!svgElement) {
        throw new Error("No SVG element found");
      }

      return true;
    } catch (err) {
      throw new Error(`SVG validation failed: ${err.message}`);
    }
  };

  const analyzeSVG = (svgString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (!svgElement) return null;

      const elements = {
        paths: doc.querySelectorAll("path").length,
        circles: doc.querySelectorAll("circle").length,
        rects: doc.querySelectorAll("rect").length,
        lines: doc.querySelectorAll("line").length,
        polygons: doc.querySelectorAll("polygon").length,
        ellipses: doc.querySelectorAll("ellipse").length,
        text: doc.querySelectorAll("text").length,
        groups: doc.querySelectorAll("g").length,
      };

      const totalElements = Object.values(elements).reduce(
        (sum, count) => sum + count,
        0
      );

      return {
        width: svgElement.getAttribute("width") || "auto",
        height: svgElement.getAttribute("height") || "auto",
        viewBox: svgElement.getAttribute("viewBox") || "none",
        elements,
        totalElements,
        hasStyles: doc.querySelectorAll("style").length > 0,
        hasScripts: doc.querySelectorAll("script").length > 0,
      };
    } catch {
      return null;
    }
  };

  const optimizeSVG = (svgString) => {
    try {
      let optimized = svgString
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, "")
        // Remove unnecessary whitespace
        .replace(/\s+/g, " ")
        .replace(/>\s+</g, "><")
        // Remove empty groups
        .replace(/<g\s*><\/g>/g, "")
        // Simplify decimal numbers (2 decimal places max)
        .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2))
        .trim();

      return optimized;
    } catch {
      return svgString;
    }
  };

  const handleSVGInput = (svgString) => {
    try {
      setError("");

      if (!svgString.trim()) {
        setSvgCode("");
        setOptimizedCode("");
        setFileInfo(null);
        return;
      }

      // Validate SVG
      validateSVG(svgString);

      // Analyze SVG
      const analysis = analyzeSVG(svgString);

      // Optimize SVG
      const optimized = optimizeSVG(svgString);

      setSvgCode(svgString);
      setOptimizedCode(optimized);

      setFileInfo({
        ...analysis,
        originalSize: formatFileSize(new Blob([svgString]).size),
        optimizedSize: formatFileSize(new Blob([optimized]).size),
        compressionRatio: Math.round(
          (1 - optimized.length / svgString.length) * 100
        ),
      });
    } catch (err) {
      setError(err.message);
      setFileInfo(null);
    }
  };

  const handleFileSelect = (file) => {
    if (
      file.type !== "image/svg+xml" &&
      !file.name.toLowerCase().endsWith(".svg")
    ) {
      setError("Please select a valid SVG file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      handleSVGInput(e.target.result);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadSVG = (content, filename = "optimized.svg") => {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleSVG = () => {
    const sample = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="100" cy="100" r="80" fill="url(#gradient)" stroke="#1F2937" stroke-width="2"/>
  
  <!-- Star shape -->
  <path d="M100,40 L110,70 L140,70 L118,92 L128,122 L100,108 L72,122 L82,92 L60,70 L90,70 Z" 
        fill="white" stroke="#1F2937" stroke-width="1"/>
  
  <!-- Text -->
  <text x="100" y="160" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="14" fill="#1F2937">Sample SVG</text>
</svg>`;
    handleSVGInput(sample);
  };

  const clearAll = () => {
    setSvgCode("");
    setOptimizedCode("");
    setError("");
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          SVG Viewer & Optimizer
        </h1>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            {[
              { key: "split", label: "Split View" },
              { key: "code", label: "Code Only" },
              { key: "preview", label: "Preview Only" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                  viewMode === key
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Drop SVG file here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports .svg files only
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Choose File
            </button>
            <button
              onClick={loadSampleSVG}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Load Sample
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* SVG Analysis */}
        {fileInfo && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              SVG Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <strong>Dimensions:</strong> {fileInfo.width} ×{" "}
                  {fileInfo.height}
                </div>
                <div>
                  <strong>ViewBox:</strong> {fileInfo.viewBox}
                </div>
                <div>
                  <strong>Total Elements:</strong> {fileInfo.totalElements}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <strong>Paths:</strong> {fileInfo.elements.paths}
                </div>
                <div>
                  <strong>Circles:</strong> {fileInfo.elements.circles}
                </div>
                <div>
                  <strong>Rectangles:</strong> {fileInfo.elements.rects}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <strong>Lines:</strong> {fileInfo.elements.lines}
                </div>
                <div>
                  <strong>Text Elements:</strong> {fileInfo.elements.text}
                </div>
                <div>
                  <strong>Groups:</strong> {fileInfo.elements.groups}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <strong>Original Size:</strong> {fileInfo.originalSize}
                </div>
                <div>
                  <strong>Optimized Size:</strong> {fileInfo.optimizedSize}
                </div>
                <div>
                  <strong>Compression:</strong> {fileInfo.compressionRatio}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {svgCode && (
          <div className="space-y-4">
            {/* Split/Code/Preview Views */}
            <div
              className={`grid gap-6 ${
                viewMode === "split"
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {/* Code Editor */}
              {(viewMode === "split" || viewMode === "code") && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      SVG Code
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(svgCode)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Copy Original
                      </button>
                      <button
                        onClick={() => copyToClipboard(optimizedCode)}
                        className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs hover:bg-green-200 dark:hover:bg-green-700"
                      >
                        Copy Optimized
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={svgCode}
                    onChange={(e) => handleSVGInput(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Preview */}
              {(viewMode === "split" || viewMode === "preview") && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Preview
                    </h3>
                    <button
                      onClick={() => downloadSVG(optimizedCode)}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-700"
                    >
                      Download Optimized
                    </button>
                  </div>
                  <div className="h-96 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 p-4 overflow-auto">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: svgCode }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Optimized Code Section */}
            {optimizedCode && optimizedCode !== svgCode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Optimized Code
                  </h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs">
                      {fileInfo?.compressionRatio}% smaller
                    </span>
                    <button
                      onClick={() => copyToClipboard(optimizedCode)}
                      className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs hover:bg-green-200 dark:hover:bg-green-700"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => downloadSVG(optimizedCode)}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-700"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={optimizedCode}
                  className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            SVG Viewer Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Live Preview:</strong> See changes in real-time
              </li>
              <li>
                • <strong>Code Editor:</strong> Edit SVG directly
              </li>
              <li>
                • <strong>Element Analysis:</strong> Count paths, shapes, text
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Optimization:</strong> Automatic code cleanup
              </li>
              <li>
                • <strong>Size Reduction:</strong> Remove unnecessary whitespace
              </li>
              <li>
                • <strong>Export Options:</strong> Download optimized version
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVGViewer;
