import { useState, useRef } from "react";

const ImageBase64Converter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64Result, setBase64Result] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const supportedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
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
        URL.revokeObjectURL(img.src); // Clean up
      };
      img.onerror = () => {
        resolve({ width: "Unknown", height: "Unknown" });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = async (file) => {
    try {
      setError("");

      if (!file) {
        throw new Error("Please select a file");
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File size must be less than 10MB");
      }

      if (!supportedFormats.includes(file.type)) {
        throw new Error(
          "Unsupported file format. Please use: JPEG, PNG, GIF, WebP, SVG, or BMP"
        );
      }

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      // Set file info
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleDateString(),
        dimensions: dimensions,
      });

      // Convert to Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setBase64Result(base64String);
        setImagePreview(base64String);
      };
      reader.onerror = () => {
        setError("Failed to read file");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setBase64Result("");
      setImagePreview("");
      setFileInfo(null);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file); // ✅ Now used
    convertToBase64(file);
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

  const copyDataURL = () => {
    copyToClipboard(base64Result);
  };

  const copyBase64Only = () => {
    const base64Only = base64Result.split(",")[1]; // Remove data:image/...;base64, part
    copyToClipboard(base64Only);
  };

  const downloadAsFile = () => {
    const blob = new Blob([base64Result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedFile?.name.split(".")[0] || "image"}.base64.txt`; // ✅ Now used
    a.click();
    URL.revokeObjectURL(url);
  };

  const reprocessFile = () => {
    if (selectedFile) {
      // ✅ Now used
      convertToBase64(selectedFile);
    }
  };

  const clearAll = () => {
    setSelectedFile(null); // ✅ Now used
    setBase64Result("");
    setError("");
    setImagePreview("");
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadSampleImage = () => {
    // Create a small sample SVG
    const svgContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#3B82F6"/>
      <circle cx="50" cy="50" r="30" fill="white"/>
      <text x="50" y="55" text-anchor="middle" fill="#3B82F6" font-size="12">Sample</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const file = new File([blob], "sample.svg", { type: "image/svg+xml" });
    handleFileSelect(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Image to Base64 Converter
        </h1>

        {/* Current File Status */}
        {selectedFile && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    File loaded: {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              </div>
              <button
                onClick={reprocessFile}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                Reprocess
              </button>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div className="mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                  Supports: JPEG, PNG, GIF, WebP, SVG, BMP
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* <div className="flex justify-center gap-2">
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
              </div> */}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2">
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

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* File Info & Preview */}
        {fileInfo && imagePreview && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Image Preview
              </h3>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 mx-auto rounded"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>

            {/* File Information */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                File Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Original File:
                    </span>
                    <div className="text-gray-900 dark:text-gray-100 font-mono break-all">
                      {selectedFile?.name}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Size:
                      </span>
                      <div className="text-gray-900 dark:text-gray-100">
                        {fileInfo.size}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Type:
                      </span>
                      <div className="text-gray-900 dark:text-gray-100">
                        {fileInfo.type}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Dimensions:
                      </span>
                      <div className="text-gray-900 dark:text-gray-100">
                        {fileInfo.dimensions.width} ×{" "}
                        {fileInfo.dimensions.height}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Modified:
                      </span>
                      <div className="text-gray-900 dark:text-gray-100">
                        {fileInfo.lastModified}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Base64 Size:
                  </span>
                  <div className="text-gray-900 dark:text-gray-100">
                    {formatFileSize(base64Result.length)}
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      (~
                      {Math.round(
                        (base64Result.length / fileInfo.sizeBytes) * 100
                      )}
                      % increase)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Base64 Output */}
        {base64Result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Base64 Output
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyDataURL}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  Copy Data URL
                </button>
                <button
                  onClick={copyBase64Only}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm focus:ring-2 focus:ring-green-500"
                >
                  Copy Base64 Only
                </button>
                <button
                  onClick={downloadAsFile}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm focus:ring-2 focus:ring-purple-500"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Data URL Output */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complete Data URL (for HTML/CSS)
              </label>
              <textarea
                readOnly
                value={base64Result}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
              />
            </div>

            {/* Base64 Only Output */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base64 String Only (without data URL prefix)
              </label>
              <textarea
                readOnly
                value={base64Result.split(",")[1]}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
              />
            </div>

            {/* Usage Examples */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
                Usage Examples
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    HTML:
                  </span>
                  <code className="block bg-blue-100 dark:bg-blue-800 p-2 rounded mt-1 text-blue-900 dark:text-blue-100 break-all">
                    {`<img src="${base64Result.substring(0, 50)}..." alt="${
                      selectedFile?.name || "Image"
                    }">`}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    CSS:
                  </span>
                  <code className="block bg-blue-100 dark:bg-blue-800 p-2 rounded mt-1 text-blue-900 dark:text-blue-100 break-all">
                    {`background-image: url(${base64Result.substring(
                      0,
                      50
                    )}...);`}
                  </code>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {base64Result.length.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Characters
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatFileSize(base64Result.length)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Base64 Size
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedFile ? formatFileSize(selectedFile.size) : "N/A"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Original Size
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Base64 Image Encoding Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Data URLs:</strong> Embed images directly in HTML/CSS
              </li>
              <li>
                • <strong>No HTTP requests:</strong> Images load instantly
              </li>
              <li>
                • <strong>Size increase:</strong> ~33% larger than original file
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Best for:</strong> Small images, icons, inline SVGs
              </li>
              <li>
                • <strong>Avoid for:</strong> Large images ({">"}10KB) due to
                size overhead
              </li>
              <li>
                • <strong>Browser support:</strong> All modern browsers support
                data URLs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageBase64Converter;
