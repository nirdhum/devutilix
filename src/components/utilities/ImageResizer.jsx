import { useState } from "react";
import Resizer from "react-image-file-resizer";

const ImageResizer = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const [settings, setSettings] = useState({
    width: 800,
    height: 600,
    quality: 80,
    format: "JPEG",
    maintainAspectRatio: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState({
    width: 0,
    height: 0,
    fileSize: 0,
  });
  const [newSize, setNewSize] = useState({ width: 0, height: 0, fileSize: 0 });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalSize({
            width: img.width,
            height: img.height,
            fileSize: file.size,
          });

          // Auto-adjust settings based on original dimensions
          if (settings.maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            setSettings((prev) => ({
              ...prev,
              height: Math.round(prev.width / aspectRatio),
            }));
          }
        };
        img.src = e.target.result;
        setOriginalImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImage = () => {
    if (!originalImage) return;

    setIsProcessing(true);

    // Convert data URL to File object for react-image-file-resizer
    const byteString = atob(originalImage.split(",")[1]);
    const mimeString = originalImage.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const file = new File([ab], "image", { type: mimeString });

    Resizer.imageFileResizer(
      file,
      settings.width,
      settings.height,
      settings.format,
      settings.quality,
      0, // rotation
      (uri) => {
        setResizedImage(uri);

        // Calculate new file size
        const byteCharacters = atob(uri.split(",")[1]);
        setNewSize({
          width: settings.width,
          height: settings.height,
          fileSize: byteCharacters.length,
        });

        setIsProcessing(false);
      },
      "base64"
    );
  };

  const downloadImage = () => {
    if (!resizedImage) return;

    const link = document.createElement("a");
    link.download = `resized-image.${settings.format.toLowerCase()}`;
    link.href = resizedImage;
    link.click();
  };

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };

      // Maintain aspect ratio if enabled
      if (
        key === "width" &&
        newSettings.maintainAspectRatio &&
        originalSize.width
      ) {
        const aspectRatio = originalSize.width / originalSize.height;
        newSettings.height = Math.round(value / aspectRatio);
      } else if (
        key === "height" &&
        newSettings.maintainAspectRatio &&
        originalSize.height
      ) {
        const aspectRatio = originalSize.width / originalSize.height;
        newSettings.width = Math.round(value * aspectRatio);
      }

      return newSettings;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Image Resizer
        </h1>

        {/* Upload Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="
              block w-full text-sm text-gray-900 dark:text-white
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200
            "
          />
        </div>

        {originalImage && (
          <>
            {/* Settings Panel */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Resize Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) =>
                      handleSettingsChange(
                        "width",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="
                      w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) =>
                      handleSettingsChange(
                        "height",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={settings.maintainAspectRatio}
                    className="
                      w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quality (%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={settings.quality}
                    onChange={(e) =>
                      handleSettingsChange("quality", parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {settings.quality}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <select
                    value={settings.format}
                    onChange={(e) =>
                      handleSettingsChange("format", e.target.value)
                    }
                    className="
                      w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    "
                  >
                    <option value="JPEG">JPEG</option>
                    <option value="PNG">PNG</option>
                    <option value="WEBP">WebP</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.maintainAspectRatio}
                    onChange={(e) =>
                      handleSettingsChange(
                        "maintainAspectRatio",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Maintain aspect ratio
                  </span>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="mb-8 flex justify-center">
              <button
                onClick={resizeImage}
                disabled={isProcessing}
                className="
                  px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                  text-white rounded-lg transition-colors
                  focus:ring-2 focus:ring-blue-500 focus:outline-none
                  disabled:cursor-not-allowed
                "
              >
                {isProcessing ? "Processing..." : "Resize Image"}
              </button>
            </div>

            {/* Preview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Original
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {originalSize.width} × {originalSize.height} •{" "}
                    {formatFileSize(originalSize.fileSize)}
                  </div>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full h-auto mx-auto rounded"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              </div>

              {/* Resized */}
              {resizedImage && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Resized
                    </h4>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {newSize.width} × {newSize.height} •{" "}
                        {formatFileSize(newSize.fileSize)}
                      </div>
                      <button
                        onClick={downloadImage}
                        className="
                          px-3 py-1 text-sm bg-green-100 text-green-800 rounded
                          hover:bg-green-200 dark:bg-green-900 dark:text-green-200
                        "
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <img
                      src={resizedImage}
                      alt="Resized"
                      className="max-w-full h-auto mx-auto rounded"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Compression Info */}
            {resizedImage && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-green-800 dark:text-green-200">
                  <strong>Size reduction:</strong>{" "}
                  {(
                    (1 - newSize.fileSize / originalSize.fileSize) *
                    100
                  ).toFixed(1)}
                  % ({formatFileSize(originalSize.fileSize - newSize.fileSize)}{" "}
                  saved)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageResizer;
