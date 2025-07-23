import { useState, useEffect, useCallback } from "react";

const HexRGBConverter = () => {
  const [hexValue, setHexValue] = useState("#3B82F6");
  const [rgbR, setRgbR] = useState(59);
  const [rgbG, setRgbG] = useState(130);
  const [rgbB, setRgbB] = useState(246);
  const [mode, setMode] = useState("hex-to-rgb");
  const [error, setError] = useState("");
  const [conversions, setConversions] = useState({});

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l;

    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Convert RGB to HSV
  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v;

    v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  // Get color name approximation
  const getColorName = (r, g, b) => {
    const colors = [
      { name: "Black", rgb: [0, 0, 0] },
      { name: "White", rgb: [255, 255, 255] },
      { name: "Red", rgb: [255, 0, 0] },
      { name: "Green", rgb: [0, 255, 0] },
      { name: "Blue", rgb: [0, 0, 255] },
      { name: "Yellow", rgb: [255, 255, 0] },
      { name: "Cyan", rgb: [0, 255, 255] },
      { name: "Magenta", rgb: [255, 0, 255] },
      { name: "Orange", rgb: [255, 165, 0] },
      { name: "Purple", rgb: [128, 0, 128] },
      { name: "Pink", rgb: [255, 192, 203] },
      { name: "Brown", rgb: [165, 42, 42] },
      { name: "Gray", rgb: [128, 128, 128] },
    ];

    let closestColor = "Unknown";
    let minDistance = Infinity;

    colors.forEach((color) => {
      const distance = Math.sqrt(
        Math.pow(r - color.rgb[0], 2) +
          Math.pow(g - color.rgb[1], 2) +
          Math.pow(b - color.rgb[2], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color.name;
      }
    });

    return closestColor;
  };

  // ✅ Fixed: Memoize generateConversions function
  const generateConversions = useCallback((r, g, b) => {
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);

    return {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl,
      hsv,
      cmyk: {
        c: Math.round((1 - r / 255) * 100),
        m: Math.round((1 - g / 255) * 100),
        y: Math.round((1 - b / 255) * 100),
        k: Math.round((1 - Math.max(r / 255, g / 255, b / 255)) * 100),
      },
      colorName: getColorName(r, g, b),
      cssFormats: {
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, 1)`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
      },
    };
  }, []); // No dependencies since helper functions are stable

  // ✅ Fixed: Extract complex expression to simple variable
  const dependencyValue =
    mode === "hex-to-rgb" ? hexValue : `${rgbR}-${rgbG}-${rgbB}`;

  // ✅ Fixed: Include all dependencies in useEffect
  useEffect(() => {
    try {
      setError("");

      if (mode === "hex-to-rgb") {
        if (!hexValue || hexValue.length < 4) {
          setError("Invalid HEX format");
          setConversions({});
          return;
        }

        const rgb = hexToRgb(hexValue);
        if (!rgb) {
          setError("Invalid HEX color");
          setConversions({});
          return;
        }

        setRgbR(rgb.r);
        setRgbG(rgb.g);
        setRgbB(rgb.b);
        setConversions(generateConversions(rgb.r, rgb.g, rgb.b));
      } else {
        const hex = rgbToHex(rgbR, rgbG, rgbB);
        setHexValue(hex);
        setConversions(generateConversions(rgbR, rgbG, rgbB));
      }
    } catch (err) {
      setError(err.message);
      setConversions({});
    }
  }, [dependencyValue, mode, hexValue, rgbR, rgbG, rgbB, generateConversions]);

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadPreset = (preset) => {
    const presets = {
      red: { hex: "#FF0000", r: 255, g: 0, b: 0 },
      green: { hex: "#00FF00", r: 0, g: 255, b: 0 },
      blue: { hex: "#0000FF", r: 0, g: 0, b: 255 },
      yellow: { hex: "#FFFF00", r: 255, g: 255, b: 0 },
      cyan: { hex: "#00FFFF", r: 0, g: 255, b: 255 },
      magenta: { hex: "#FF00FF", r: 255, g: 0, b: 255 },
      black: { hex: "#000000", r: 0, g: 0, b: 0 },
      white: { hex: "#FFFFFF", r: 255, g: 255, b: 255 },
      gray: { hex: "#808080", r: 128, g: 128, b: 128 },
      orange: { hex: "#FFA500", r: 255, g: 165, b: 0 },
    };

    const color = presets[preset];
    if (color) {
      setHexValue(color.hex);
      setRgbR(color.r);
      setRgbG(color.g);
      setRgbB(color.b);
    }
  };

  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    setRgbR(r);
    setRgbG(g);
    setRgbB(b);
    setHexValue(rgbToHex(r, g, b));
  };

  const currentColor = conversions.hex || hexValue;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          HEX ↔ RGB Color Converter
        </h1>

        {/* Color Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <div
              className="w-32 h-32 rounded-lg border-4 border-white shadow-lg"
              style={{ backgroundColor: currentColor }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {currentColor}
            </span>
            {conversions.colorName && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Closest color: {conversions.colorName}
              </div>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md mx-auto">
            <button
              onClick={() => setMode("hex-to-rgb")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "hex-to-rgb"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              HEX → RGB
            </button>
            <button
              onClick={() => setMode("rgb-to-hex")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "rgb-to-hex"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              RGB → HEX
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {mode === "hex-to-rgb" ? (
            // HEX Input
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HEX Color
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={hexValue}
                  onChange={(e) => setHexValue(e.target.value.toUpperCase())}
                  placeholder="#FF0000"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setHexValue(e.target.value.toUpperCase())}
                  className="w-12 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg cursor-pointer"
                />
              </div>
            </div>
          ) : (
            // RGB Input
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                RGB Values
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Red (0-255)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbR}
                    onChange={(e) =>
                      setRgbR(
                        Math.max(
                          0,
                          Math.min(255, parseInt(e.target.value) || 0)
                        )
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Green (0-255)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbG}
                    onChange={(e) =>
                      setRgbG(
                        Math.max(
                          0,
                          Math.min(255, parseInt(e.target.value) || 0)
                        )
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Blue (0-255)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbB}
                    onChange={(e) =>
                      setRgbB(
                        Math.max(
                          0,
                          Math.min(255, parseInt(e.target.value) || 0)
                        )
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Color Sliders */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              RGB Sliders
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Red: {rgbR}
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbR}
                  onChange={(e) => setRgbR(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Green: {rgbG}
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbG}
                  onChange={(e) => setRgbG(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Blue: {rgbB}
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbB}
                  onChange={(e) => setRgbB(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Color Presets
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "red",
              "green",
              "blue",
              "yellow",
              "cyan",
              "magenta",
              "orange",
              "black",
              "white",
              "gray",
            ].map((color) => (
              <button
                key={color}
                onClick={() => loadPreset(color)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 capitalize"
              >
                {color}
              </button>
            ))}
            <button
              onClick={randomColor}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Random
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Conversion Results */}
        {Object.keys(conversions).length > 0 && !error && (
          <div className="space-y-6">
            {/* All Color Formats */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                All Color Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    label: "HEX",
                    value: conversions.hex,
                    description: "Hexadecimal notation",
                  },
                  {
                    label: "RGB",
                    value: `${conversions.rgb.r}, ${conversions.rgb.g}, ${conversions.rgb.b}`,
                    description: "Red, Green, Blue",
                  },
                  {
                    label: "HSL",
                    value: `${conversions.hsl.h}°, ${conversions.hsl.s}%, ${conversions.hsl.l}%`,
                    description: "Hue, Saturation, Lightness",
                  },
                  {
                    label: "HSV",
                    value: `${conversions.hsv.h}°, ${conversions.hsv.s}%, ${conversions.hsv.v}%`,
                    description: "Hue, Saturation, Value",
                  },
                  {
                    label: "CMYK",
                    value: `${conversions.cmyk.c}%, ${conversions.cmyk.m}%, ${conversions.cmyk.y}%, ${conversions.cmyk.k}%`,
                    description: "Cyan, Magenta, Yellow, Key",
                  },
                ].map(({ label, value, description }) => (
                  <div
                    key={label}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {label}
                      </span>
                      <button
                        onClick={() => copyValue(value)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="block font-mono text-sm text-gray-900 dark:text-gray-100 mb-1">
                      {value}
                    </code>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Formats */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                CSS Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(conversions.cssFormats).map(
                  ([format, value]) => (
                    <div
                      key={format}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm uppercase">
                          {format}
                        </span>
                        <button
                          onClick={() => copyValue(value)}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500"
                        >
                          Copy
                        </button>
                      </div>
                      <code className="block font-mono text-sm text-gray-900 dark:text-gray-100">
                        {value}
                      </code>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Color Format Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>HEX:</strong> Most common web format (#RRGGBB)
              </li>
              <li>
                • <strong>RGB:</strong> Red, Green, Blue values (0-255)
              </li>
              <li>
                • <strong>HSL:</strong> More intuitive color adjustments
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>HSV:</strong> Alternative to HSL for color picking
              </li>
              <li>
                • <strong>CMYK:</strong> Used in printing (subtractive color)
              </li>
              <li>• Use sliders or color picker for interactive selection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexRGBConverter;
