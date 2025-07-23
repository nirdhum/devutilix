import { useState, useEffect, useCallback } from "react";

// ✅ Move units array outside component to prevent recreation
const UNITS = [
  { value: "px", label: "Pixels (px)", description: "Absolute unit" },
  {
    value: "em",
    label: "Em (em)",
    description: "Relative to parent font-size",
  },
  {
    value: "rem",
    label: "Root Em (rem)",
    description: "Relative to root font-size",
  },
  {
    value: "%",
    label: "Percentage (%)",
    description: "Relative to parent element",
  },
  {
    value: "vw",
    label: "Viewport Width (vw)",
    description: "1% of viewport width",
  },
  {
    value: "vh",
    label: "Viewport Height (vh)",
    description: "1% of viewport height",
  },
  {
    value: "vmin",
    label: "Viewport Min (vmin)",
    description: "1% of smaller viewport dimension",
  },
  {
    value: "vmax",
    label: "Viewport Max (vmax)",
    description: "1% of larger viewport dimension",
  },
  { value: "pt", label: "Points (pt)", description: "1/72 of an inch" },
  { value: "pc", label: "Picas (pc)", description: "12 points" },
  { value: "in", label: "Inches (in)", description: "Physical inch" },
  {
    value: "cm",
    label: "Centimeters (cm)",
    description: "Physical centimeter",
  },
  {
    value: "mm",
    label: "Millimeters (mm)",
    description: "Physical millimeter",
  },
];

const CSSUnitsConverter = () => {
  const [inputValue, setInputValue] = useState("16");
  const [fromUnit, setFromUnit] = useState("px");
  const [baseFont, setBaseFont] = useState(16);
  const [parentFont, setParentFont] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [error, setError] = useState("");
  const [conversions, setConversions] = useState([]);

  const convertToPixels = useCallback(
    (value, unit) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 0;

      switch (unit) {
        case "px":
          return numValue;
        case "em":
          return numValue * parentFont;
        case "rem":
          return numValue * baseFont;
        case "%":
          return (numValue / 100) * parentFont;
        case "vw":
          return (numValue / 100) * viewportWidth;
        case "vh":
          return (numValue / 100) * viewportHeight;
        case "vmin":
          return (numValue / 100) * Math.min(viewportWidth, viewportHeight);
        case "vmax":
          return (numValue / 100) * Math.max(viewportWidth, viewportHeight);
        case "pt":
          return numValue * (96 / 72);
        case "pc":
          return numValue * 16;
        case "in":
          return numValue * 96;
        case "cm":
          return numValue * 37.795275591;
        case "mm":
          return numValue * 3.7795275591;
        default:
          return 0;
      }
    },
    [baseFont, parentFont, viewportWidth, viewportHeight]
  );

  const convertFromPixels = useCallback(
    (pixels, unit) => {
      if (pixels === 0) return 0;

      switch (unit) {
        case "px":
          return pixels;
        case "em":
          return pixels / parentFont;
        case "rem":
          return pixels / baseFont;
        case "%":
          return (pixels / parentFont) * 100;
        case "vw":
          return (pixels / viewportWidth) * 100;
        case "vh":
          return (pixels / viewportHeight) * 100;
        case "vmin":
          return (pixels / Math.min(viewportWidth, viewportHeight)) * 100;
        case "vmax":
          return (pixels / Math.max(viewportWidth, viewportHeight)) * 100;
        case "pt":
          return pixels * (72 / 96);
        case "pc":
          return pixels / 16;
        case "in":
          return pixels / 96;
        case "cm":
          return pixels / 37.795275591;
        case "mm":
          return pixels / 3.7795275591;
        default:
          return 0;
      }
    },
    [baseFont, parentFont, viewportWidth, viewportHeight]
  );

  // ✅ Fixed useEffect - no longer includes 'units' in dependencies
  useEffect(() => {
    try {
      const value = parseFloat(inputValue);
      if (isNaN(value) || !inputValue.trim()) {
        setError("Please enter a valid number");
        setConversions([]);
        return;
      }

      setError("");

      const pixels = convertToPixels(value, fromUnit);

      const newConversions = UNITS.map((unit) => ({
        ...unit,
        convertedValue: convertFromPixels(pixels, unit.value),
      }));

      setConversions(newConversions);
    } catch (err) {
      setError(err.message);
      setConversions([]);
    }
  }, [inputValue, fromUnit, convertToPixels, convertFromPixels]); // ✅ Removed 'units'

  const loadPreset = (preset) => {
    switch (preset) {
      case "mobile":
        setViewportWidth(375);
        setViewportHeight(667);
        setBaseFont(16);
        setParentFont(16);
        break;
      case "tablet":
        setViewportWidth(768);
        setViewportHeight(1024);
        setBaseFont(16);
        setParentFont(16);
        break;
      case "desktop":
        setViewportWidth(1920);
        setViewportHeight(1080);
        setBaseFont(16);
        setParentFont(16);
        break;
      case "print":
        setViewportWidth(794);
        setViewportHeight(1123);
        setBaseFont(12);
        setParentFont(12);
        break;
    }
  };

  const copyValue = async (value, unit) => {
    try {
      const formattedValue =
        value % 1 === 0 ? value.toString() : value.toFixed(4);
      await navigator.clipboard.writeText(`${formattedValue}${unit}`);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatValue = (value) => {
    if (value === 0) return "0";
    if (value % 1 === 0) return value.toString();
    if (value < 0.001) return value.toExponential(2);
    return value.toFixed(4).replace(/\.?0+$/, "");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          CSS Units Converter
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Convert From */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Convert From
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Context Settings */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Context Settings
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Root Font Size (px)
                  </label>
                  <input
                    type="number"
                    value={baseFont}
                    onChange={(e) =>
                      setBaseFont(parseFloat(e.target.value) || 16)
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent Font Size (px)
                  </label>
                  <input
                    type="number"
                    value={parentFont}
                    onChange={(e) =>
                      setParentFont(parseFloat(e.target.value) || 16)
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Viewport Width (px)
                  </label>
                  <input
                    type="number"
                    value={viewportWidth}
                    onChange={(e) =>
                      setViewportWidth(parseFloat(e.target.value) || 1920)
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Viewport Height (px)
                  </label>
                  <input
                    type="number"
                    value={viewportHeight}
                    onChange={(e) =>
                      setViewportHeight(parseFloat(e.target.value) || 1080)
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Device Presets
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "mobile", label: "Mobile (375×667)" },
              { key: "tablet", label: "Tablet (768×1024)" },
              { key: "desktop", label: "Desktop (1920×1080)" },
              { key: "print", label: "Print (A4)" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => loadPreset(key)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!error && conversions.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Conversion Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversions.map(
                ({ value, label, description, convertedValue }) => (
                  <div
                    key={value}
                    className={`p-4 rounded-lg border ${
                      value === fromUnit
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {label}
                      </span>
                      <button
                        onClick={() => copyValue(convertedValue, value)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="font-mono text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {formatValue(convertedValue)}
                      {value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {description}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Reference Table */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
            CSS Units Reference
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div className="space-y-2">
              <div>
                <strong>Relative Units:</strong>
              </div>
              <div>
                • <code>em</code> - Relative to parent element font-size
              </div>
              <div>
                • <code>rem</code> - Relative to root element font-size
              </div>
              <div>
                • <code>%</code> - Relative to parent element
              </div>
              <div>
                • <code>vw/vh</code> - Viewport width/height percentage
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <strong>Absolute Units:</strong>
              </div>
              <div>
                • <code>px</code> - Pixels (most common)
              </div>
              <div>
                • <code>pt</code> - Points (good for print)
              </div>
              <div>
                • <code>in/cm/mm</code> - Physical measurements
              </div>
              <div>
                • <code>pc</code> - Picas (typography)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSUnitsConverter;
