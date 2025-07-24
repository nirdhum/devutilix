import { useState, useRef } from "react";

const ImageOptimizer = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [optimizedFile, setOptimizedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState({
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    outputFormat: "jpeg", // 'jpeg', 'png', 'webp'
    maintainAspectRatio: true,
  });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const supportedFormats = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/gif",
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: "Unknown", height: "Unknown" });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const calculateOptimalDimensions = (
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight,
    maintainAspectRatio
  ) => {
    if (!maintainAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight),
      };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    if (originalWidth / maxWidth > originalHeight / maxHeight) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio),
      };
    } else {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight,
      };
    }
  };

  const compressImage = (
    file,
    quality,
    maxWidth,
    maxHeight,
    outputFormat,
    maintainAspectRatio
  ) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = canvasRef.current || document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Calculate optimal dimensions
          const { width, height } = calculateOptimalDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight,
            maintainAspectRatio
          );

          canvas.width = width;
          canvas.height = height;

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw and resize image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          const mimeType = `image/${outputFormat}`;
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  blob,
                  dimensions: { width, height },
                  size: blob.size,
                  type: mimeType,
                });
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            mimeType,
            outputFormat === "jpeg" ? quality : undefined // PNG/WebP use different quality handling
          );

          URL.revokeObjectURL(img.src);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    try {
      setError("");
      setOptimizedFile(null);
      setProgress(0);

      if (!file) {
        setError("Please select a file");
        return;
      }

      if (!supportedFormats.includes(file.type)) {
        setError(
          "Unsupported file format. Please use JPEG, PNG, WebP, BMP, or GIF"
        );
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError("File size must be less than 50MB");
        return;
      }

      const dimensions = await getImageDimensions(file);

      setOriginalFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        dimensions,
        url: URL.createObjectURL(file),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const optimizeImage = async () => {
    if (!originalFile) {
      setError("Please select an image first");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setProgress(25);

      const compressed = await compressImage(
        originalFile.file,
        settings.quality,
        settings.maxWidth,
        settings.maxHeight,
        settings.outputFormat,
        settings.maintainAspectRatio
      );

      setProgress(75);

      const optimizedFileName = generateOptimizedFileName(
        originalFile.name,
        settings.outputFormat
      );

      setOptimizedFile({
        file: compressed.blob,
        name: optimizedFileName,
        size: compressed.size,
        type: compressed.type,
        dimensions: compressed.dimensions,
        url: URL.createObjectURL(compressed.blob),
      });

      setProgress(100);
    } catch (err) {
      setError(err.message);
      setOptimizedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateOptimizedFileName = (originalName, format) => {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    const extension = format === "jpeg" ? "jpg" : format;
    return `${nameWithoutExt}_optimized.${extension}`;
  };

  const downloadOptimizedImage = () => {
    if (!optimizedFile) return;

    const link = document.createElement("a");
    link.href = optimizedFile.url;
    link.download = optimizedFile.name;
    link.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadSampleImage = () => {
    // Create a sample colored rectangle as image for testing
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    // Create gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#3B82F6");
    gradient.addColorStop(0.5, "#8B5CF6");
    gradient.addColorStop(1, "#EC4899");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some shapes and text
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(300, 200, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(900, 600, 150, 0, Math.PI * 2);
    ctx.fill();

    // Add text
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Sample Image for Optimization",
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.font = "32px Arial";
    ctx.fillText(
      "1200×800 • High Quality Test Image",
      canvas.width / 2,
      canvas.height / 2 + 60
    );
    ctx.font = "24px Arial";
    ctx.fillText(
      "Perfect for testing compression settings",
      canvas.width / 2,
      canvas.height / 2 + 100
    );

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "sample-image.png", {
          type: "image/png",
        });
        handleFileSelect(file);
      },
      "image/png",
      1.0
    );
  };

  const clearAll = () => {
    setOriginalFile(null);
    setOptimizedFile(null);
    setError("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCompressionStats = () => {
    if (!originalFile || !optimizedFile) return null;

    const sizeReduction = originalFile.size - optimizedFile.size;
    const compressionRatio = (
      (sizeReduction / originalFile.size) *
      100
    ).toFixed(1);
    const dimensionChange =
      originalFile.dimensions.width !== optimizedFile.dimensions.width ||
      originalFile.dimensions.height !== optimizedFile.dimensions.height;

    return {
      originalSize: formatFileSize(originalFile.size),
      optimizedSize: formatFileSize(optimizedFile.size),
      savedSize: formatFileSize(sizeReduction),
      compressionRatio: compressionRatio,
      dimensionChange,
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Image Optimizer
        </h1>

        {/* File Upload Area */}
        <div className="mb-6">
          <div
            className="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={supportedFormats.join(",")}
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supports: JPEG, PNG, WebP, BMP, GIF (Max 50MB)
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Choose File
          </button>
          <button
            onClick={loadSampleImage}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-500"
          >
            Load Sample
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>

        {/* Settings */}
        {originalFile && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Optimization Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Output Format
                </label>
                <select
                  value={settings.outputFormat}
                  onChange={(e) =>
                    updateSetting("outputFormat", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="jpeg">JPEG (smaller file size)</option>
                  <option value="png">PNG (lossless, transparency)</option>
                  <option value="webp">WebP (best compression)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quality ({Math.round(settings.quality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.quality}
                  onChange={(e) =>
                    updateSetting("quality", parseFloat(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.maintainAspectRatio}
                    onChange={(e) =>
                      updateSetting("maintainAspectRatio", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Maintain aspect ratio
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxWidth}
                  onChange={(e) =>
                    updateSetting("maxWidth", parseInt(e.target.value) || 1920)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxHeight}
                  onChange={(e) =>
                    updateSetting("maxHeight", parseInt(e.target.value) || 1080)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={optimizeImage}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Optimizing..." : "Optimize Image"}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Processing...
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Image Comparison */}
        {originalFile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Original Image */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Original Image
              </h3>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <img
                  src={originalFile.url}
                  alt="Original"
                  className="max-w-full h-auto max-h-64 mx-auto rounded mb-3"
                  style={{ objectFit: "contain" }}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>
                    📁 <strong>Name:</strong> {originalFile.name}
                  </div>
                  <div>
                    📏 <strong>Dimensions:</strong>{" "}
                    {originalFile.dimensions.width} ×{" "}
                    {originalFile.dimensions.height}
                  </div>
                  <div>
                    💾 <strong>Size:</strong>{" "}
                    {formatFileSize(originalFile.size)}
                  </div>
                  <div>
                    🎨 <strong>Format:</strong> {originalFile.type}
                  </div>
                </div>
              </div>
            </div>

            {/* Optimized Image */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Optimized Image
                </h3>
                {optimizedFile && (
                  <button
                    onClick={downloadOptimizedImage}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm focus:ring-2 focus:ring-green-500"
                  >
                    Download
                  </button>
                )}
              </div>

              {optimizedFile ? (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <img
                    src={optimizedFile.url}
                    alt="Optimized"
                    className="max-w-full h-auto max-h-64 mx-auto rounded mb-3"
                    style={{ objectFit: "contain" }}
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>
                      📁 <strong>Name:</strong> {optimizedFile.name}
                    </div>
                    <div>
                      📏 <strong>Dimensions:</strong>{" "}
                      {optimizedFile.dimensions.width} ×{" "}
                      {optimizedFile.dimensions.height}
                    </div>
                    <div>
                      💾 <strong>Size:</strong>{" "}
                      {formatFileSize(optimizedFile.size)}
                    </div>
                    <div>
                      🎨 <strong>Format:</strong> {optimizedFile.type}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-300 dark:border-gray-600 border-dashed rounded-lg p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    Optimized image will appear here
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compression Statistics */}
        {getCompressionStats() && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">
              📊 Optimization Results
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-800 dark:text-green-300">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  -{getCompressionStats().compressionRatio}%
                </div>
                <div>Size Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {getCompressionStats().savedSize}
                </div>
                <div>Space Saved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {getCompressionStats().originalSize}
                </div>
                <div>Original Size</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {getCompressionStats().optimizedSize}
                </div>
                <div>Final Size</div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Image Optimization Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Format Conversion:</strong> JPEG, PNG, WebP support
              </li>
              <li>
                • <strong>Quality Control:</strong> Adjustable compression
                levels
              </li>
              <li>
                • <strong>Resize Options:</strong> Custom width/height limits
              </li>
              <li>
                • <strong>Aspect Ratio:</strong> Maintain proportions
                automatically
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Client-Side:</strong> No server upload required
              </li>
              <li>
                • <strong>Real-Time Preview:</strong> See results before
                download
              </li>
              <li>
                • <strong>Size Comparison:</strong> Track compression savings
              </li>
              <li>
                • <strong>Modern APIs:</strong> Uses latest browser technologies
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptimizer;
