import { useState, useRef } from "react";

const ASCIIArtGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [asciiArt, setAsciiArt] = useState("");
  const [mode, setMode] = useState("text"); // 'text' or 'image'
  const [settings, setSettings] = useState({
    font: "standard",
    width: 80,
    characterSet: "standard",
    inverted: false,
    scale: 1,
  });
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ASCII character sets for different density levels
  const characterSets = {
    standard: " .:-=+*#%@",
    detailed:
      " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    minimal: " .-+#@",
    blocks: " ░▒▓█",
    numbers: " 123456789",
    custom: " .oO0@",
  };

  // ASCII fonts (simplified representations)
  const asciiFonts = {
    standard: {
      height: 1,
      chars: {
        A: ["█▀█", "█▀█", "▀ █"],
        B: ["█▀▄", "█▀▄", "▀▀▀"],
        C: ["▄▀█", "█▄▄", "▀▀▀"],
        D: ["█▀▄", "█ █", "▀▀▀"],
        E: ["█▀▀", "█▀▀", "▀▀▀"],
        F: ["█▀▀", "█▀▀", "▀  "],
        G: ["▄▀█", "█▄█", "▀▀▀"],
        H: ["█ █", "███", "▀ ▀"],
        I: ["███", " █ ", "▀▀▀"],
        J: ["  █", "  █", "▀▀▀"],
        K: ["█ █", "██ ", "▀ ▀"],
        L: ["█  ", "█  ", "▀▀▀"],
        M: ["█▀█", "█▀█", "▀ ▀"],
        N: ["█▀█", "█ █", "▀ ▀"],
        O: ["▄▀█", "█ █", "▀▀▀"],
        P: ["█▀▄", "█▀ ", "▀  "],
        Q: ["▄▀█", "█▄█", "▀▀█"],
        R: ["█▀▄", "█▀▄", "▀ ▀"],
        S: ["▄▀▀", "▀▀▄", "▀▀▀"],
        T: ["███", " █ ", " ▀ "],
        U: ["█ █", "█ █", "▀▀▀"],
        V: ["█ █", "█ █", " ▀ "],
        W: ["█ █", "█▀█", "▀ ▀"],
        X: ["█ █", " █ ", "▀ ▀"],
        Y: ["█ █", " █ ", " ▀ "],
        Z: ["███", " █ ", "▀▀▀"],
        " ": ["   ", "   ", "   "],
        0: ["▄▀█", "█ █", "▀▀▀"],
        1: [" █ ", " █ ", " ▀ "],
        2: ["▀▀█", "▄▀ ", "▀▀▀"],
        3: ["▀▀█", "▀▀█", "▀▀▀"],
        4: ["█ █", "▀▀█", "  ▀"],
        5: ["█▀▀", "▀▀█", "▀▀▀"],
        6: ["▄▀▀", "█▀█", "▀▀▀"],
        7: ["███", "  █", "  ▀"],
        8: ["▄▀█", "▄▀█", "▀▀▀"],
        9: ["▄▀█", "▀▀█", "▀▀▀"],
      },
    },
    big: {
      height: 5,
      chars: {
        A: ["  ██  ", " ████ ", "██  ██", "██████", "██  ██"],
        B: ["██████", "██  ██", "██████", "██  ██", "██████"],
        C: [" █████", "██    ", "██    ", "██    ", " █████"],
        D: ["██████", "██  ██", "██  ██", "██  ██", "██████"],
        E: ["██████", "██    ", "██████", "██    ", "██████"],
        F: ["██████", "██    ", "██████", "██    ", "██    "],
        G: [" █████", "██    ", "██ ███", "██  ██", " █████"],
        H: ["██  ██", "██  ██", "██████", "██  ██", "██  ██"],
        I: ["██████", "  ██  ", "  ██  ", "  ██  ", "██████"],
        J: ["██████", "    ██", "    ██", "██  ██", " █████"],
        K: ["██  ██", "██ ██ ", "████  ", "██ ██ ", "██  ██"],
        L: ["██    ", "██    ", "██    ", "██    ", "██████"],
        M: ["██  ██", "██████", "██████", "██  ██", "██  ██"],
        N: ["██  ██", "███ ██", "██████", "██ ███", "██  ██"],
        O: [" █████", "██  ██", "██  ██", "██  ██", " █████"],
        P: ["██████", "██  ██", "██████", "██    ", "██    "],
        Q: [" █████", "██  ██", "██  ██", "██ ███", " ██████"],
        R: ["██████", "██  ██", "██████", "██ ██ ", "██  ██"],
        S: [" █████", "██    ", " █████", "    ██", "█████ "],
        T: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
        U: ["██  ██", "██  ██", "██  ██", "██  ██", " █████"],
        V: ["██  ██", "██  ██", "██  ██", " ████ ", "  ██  "],
        W: ["██  ██", "██  ██", "██████", "██████", "██  ██"],
        X: ["██  ██", " ████ ", "  ██  ", " ████ ", "██  ██"],
        Y: ["██  ██", " ████ ", "  ██  ", "  ██  ", "  ██  "],
        Z: ["██████", "   ██ ", "  ██  ", " ██   ", "██████"],
        " ": ["      ", "      ", "      ", "      ", "      "],
      },
    },
    small: {
      height: 3,
      chars: {
        A: ["▄▀█", "█▀█", "▀ █"],
        B: ["█▀▄", "█▀▄", "▀▀▀"],
        C: ["▄▀▀", "█▄▄", "▀▀▀"],
        D: ["█▀▄", "█ █", "▀▀▀"],
        E: ["█▀▀", "█▀▀", "▀▀▀"],
        F: ["█▀▀", "█▀▀", "▀  "],
        G: ["▄▀▀", "█▄█", "▀▀▀"],
        H: ["█ █", "███", "▀ ▀"],
        I: ["███", " █ ", "▀▀▀"],
        J: ["▀▀█", "  █", "▀▀▀"],
        K: ["█ █", "██ ", "▀ ▀"],
        L: ["█  ", "█  ", "▀▀▀"],
        M: ["█▄▀", "█▀█", "▀ ▀"],
        N: ["█▀█", "█ █", "▀ ▀"],
        O: ["▄▀█", "█ █", "▀▀▀"],
        P: ["█▀▄", "█▀ ", "▀  "],
        Q: ["▄▀█", "█▄█", "▀▀█"],
        R: ["█▀▄", "█▀▄", "▀ ▀"],
        S: ["▄▀▀", "▀▀▄", "▀▀▀"],
        T: ["███", " █ ", " ▀ "],
        U: ["█ █", "█ █", "▀▀▀"],
        V: ["█ █", "█ █", " ▀ "],
        W: ["█ █", "█▀█", "▀ ▀"],
        X: ["█ █", " █ ", "▀ ▀"],
        Y: ["█ █", " █ ", " ▀ "],
        Z: ["███", " █ ", "▀▀▀"],
        " ": ["   ", "   ", "   "],
      },
    },
  };

  const generateTextAscii = () => {
    try {
      setError("");
      setIsProcessing(true);

      if (!inputText.trim()) {
        throw new Error("Please enter text to convert");
      }

      const font = asciiFonts[settings.font];
      const lines = [];

      // Initialize lines array
      for (let i = 0; i < font.height; i++) {
        lines[i] = "";
      }

      // Process each character
      for (const char of inputText.toUpperCase()) {
        const charPattern = font.chars[char] || font.chars[" "];

        for (let i = 0; i < font.height; i++) {
          lines[i] += charPattern[i] + " ";
        }
      }

      // Join lines and apply settings
      let result = lines.join("\n");

      // Apply character replacement if not using block characters
      if (settings.characterSet !== "blocks") {
        const chars = characterSets[settings.characterSet];
        result = result.replace(/█/g, chars[chars.length - 1]);
        result = result.replace(/▓/g, chars[Math.floor(chars.length * 0.8)]);
        result = result.replace(/▒/g, chars[Math.floor(chars.length * 0.6)]);
        result = result.replace(/░/g, chars[Math.floor(chars.length * 0.4)]);
        result = result.replace(/▀/g, chars[Math.floor(chars.length * 0.5)]);
        result = result.replace(/▄/g, chars[Math.floor(chars.length * 0.7)]);
      }

      // Apply inversion
      if (settings.inverted) {
        const chars = characterSets[settings.characterSet];
        result = result
          .split("")
          .map((char) => {
            const index = chars.indexOf(char);
            if (index !== -1) {
              return chars[chars.length - 1 - index];
            }
            return char;
          })
          .join("");
      }

      setAsciiArt(result);
    } catch (err) {
      setError(err.message);
      setAsciiArt("");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateImageAscii = (imageFile) => {
    try {
      setError("");
      setIsProcessing(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate dimensions
          const maxWidth = settings.width;
          const aspectRatio = img.height / img.width;
          const width = Math.min(maxWidth, img.width);
          const height = Math.floor(width * aspectRatio * 0.5); // ASCII chars are taller than wide

          canvas.width = width;
          canvas.height = height;

          // Draw and get image data
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const pixels = imageData.data;

          const chars = characterSets[settings.characterSet];
          let result = "";

          // Process each pixel
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const index = (y * width + x) * 4;
              const r = pixels[index];
              const g = pixels[index + 1];
              const b = pixels[index + 2];

              // Calculate brightness (0-255)
              const brightness = Math.round((r + g + b) / 3);

              // Map brightness to character
              let charIndex = Math.floor(
                (brightness / 255) * (chars.length - 1)
              );

              if (settings.inverted) {
                charIndex = chars.length - 1 - charIndex;
              }

              result += chars[charIndex];
            }
            result += "\n";
          }

          setAsciiArt(result.trim());
          URL.revokeObjectURL(img.src);
        } catch {
          setError("Failed to process image");
          setAsciiArt("");
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setError("Failed to load image");
        setIsProcessing(false);
      };

      img.src = URL.createObjectURL(imageFile);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image file must be smaller than 5MB");
      return;
    }

    generateImageAscii(file);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(asciiArt);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([asciiArt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascii-art-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    if (mode === "text") {
      setInputText("HELLO WORLD");
      setError("");
      setAsciiArt("");
    } else {
      // Create a sample pattern for image mode
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      // Create gradient pattern
      const gradient = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 100, 100);

      canvas.toBlob((blob) => {
        generateImageAscii(blob);
      });
    }
  };

  const clearAll = () => {
    setInputText("");
    setAsciiArt("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ASCII Art Generator
        </h1>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            <button
              onClick={() => setMode("text")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "text"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Text to ASCII
            </button>
            <button
              onClick={() => setMode("image")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "image"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Image to ASCII
            </button>
          </div>
        </div>

        {/* Input Section */}
        {mode === "text" ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Input
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to convert to ASCII art..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Upload
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supports: JPG, PNG, GIF, WebP (Max 5MB)
            </p>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {mode === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Style
              </label>
              <select
                value={settings.font}
                onChange={(e) => updateSetting("font", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small (3 lines)</option>
                <option value="standard">Standard (3 lines)</option>
                <option value="big">Big (5 lines)</option>
              </select>
            </div>
          )}

          {mode === "image" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Width (chars)
              </label>
              <input
                type="number"
                min="20"
                max="200"
                value={settings.width}
                onChange={(e) =>
                  updateSetting("width", parseInt(e.target.value) || 80)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Character Set
            </label>
            <select
              value={settings.characterSet}
              onChange={(e) => updateSetting("characterSet", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard ( .:-=+*#%@ )</option>
              <option value="detailed">Detailed (70+ chars)</option>
              <option value="minimal">Minimal ( .-+#@ )</option>
              <option value="blocks">Blocks ( ░▒▓█ )</option>
              <option value="numbers">Numbers ( 123456789 )</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.inverted}
                onChange={(e) => updateSetting("inverted", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Invert colors
              </span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={mode === "text" ? generateTextAscii : () => {}}
            disabled={isProcessing || (mode === "text" && !inputText.trim())}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Generating..."
              : `Generate ${mode === "text" ? "Text" : "Image"} ASCII`}
          </button>
          <button
            onClick={loadSample}
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
          {asciiArt && (
            <>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                Copy ASCII
              </button>
              <button
                onClick={downloadAsFile}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                Download
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-6 flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Generating ASCII art...
            </span>
          </div>
        )}

        {/* ASCII Art Output */}
        {asciiArt && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Generated ASCII Art
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {asciiArt.split("\n").length} lines, {asciiArt.length}{" "}
                characters
              </div>
            </div>

            <div className="bg-black dark:bg-gray-950 p-4 rounded-lg overflow-auto">
              <pre className="text-green-400 font-mono text-xs leading-tight whitespace-pre">
                {asciiArt}
              </pre>
            </div>

            {/* Preview on white background */}
            <div className="bg-white dark:bg-gray-100 p-4 rounded-lg overflow-auto">
              <pre className="text-black font-mono text-xs leading-tight whitespace-pre">
                {asciiArt}
              </pre>
            </div>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            ASCII Art Generator Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Text to ASCII:</strong> Convert text with multiple
                font styles
              </li>
              <li>
                • <strong>Image to ASCII:</strong> Convert images with
                customizable width
              </li>
              <li>
                • <strong>Character Sets:</strong> Standard, detailed, minimal,
                blocks, numbers
              </li>
              <li>
                • <strong>Customization:</strong> Invert colors, adjust width
                and density
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Multiple Previews:</strong> Dark and light backgrounds
              </li>
              <li>
                • <strong>Export Options:</strong> Copy to clipboard or download
                as file
              </li>
              <li>
                • <strong>Image Support:</strong> JPG, PNG, GIF, WebP formats
              </li>
              <li>
                • <strong>Real-time:</strong> Instant preview with setting
                changes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASCIIArtGenerator;
