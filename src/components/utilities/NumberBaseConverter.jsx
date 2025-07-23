import { useState, useEffect } from "react";

const NumberBaseConverter = () => {
  const [inputValue, setInputValue] = useState("42");
  const [inputBase, setInputBase] = useState(10);
  const [error, setError] = useState("");
  const [conversions, setConversions] = useState({});

  const commonBases = [
    { value: 2, label: "Binary (Base 2)", description: "Uses digits 0-1" },
    { value: 8, label: "Octal (Base 8)", description: "Uses digits 0-7" },
    { value: 10, label: "Decimal (Base 10)", description: "Uses digits 0-9" },
    {
      value: 16,
      label: "Hexadecimal (Base 16)",
      description: "Uses digits 0-9, A-F",
    },
    { value: 32, label: "Base32", description: "Uses A-Z, 2-7" },
    { value: 36, label: "Base36", description: "Uses digits 0-9, A-Z" },
  ];

  const isValidForBase = (value, base) => {
    const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base);
    return value
      .toUpperCase()
      .split("")
      .every((char) => validChars.includes(char));
  };

  const convertToDecimal = (value, fromBase) => {
    if (!value.trim()) return 0;
    return parseInt(value.replace(/\s/g, ""), fromBase);
  };

  const convertFromDecimal = (decimal, toBase) => {
    if (decimal === 0) return "0";
    return decimal.toString(toBase).toUpperCase();
  };

  const formatBinary = (binary) => {
    // Group binary digits in groups of 4 for better readability
    return binary.replace(/(.{4})/g, "$1 ").trim();
  };

  const getByteRepresentation = (decimal) => {
    if (decimal < 0 || decimal > 4294967295) return null; // 32-bit limit

    const binary = decimal.toString(2).padStart(32, "0");
    const bytes = [];
    for (let i = 0; i < 32; i += 8) {
      bytes.push(binary.slice(i, i + 8));
    }
    return bytes.join(" ");
  };

  useEffect(() => {
    try {
      setError("");

      if (!inputValue.trim()) {
        setConversions({});
        return;
      }

      if (!isValidForBase(inputValue, inputBase)) {
        throw new Error(`Invalid characters for base ${inputBase}`);
      }

      const decimal = convertToDecimal(inputValue, inputBase);

      if (isNaN(decimal)) {
        throw new Error("Invalid number format");
      }

      const newConversions = {
        decimal: decimal,
        binary: convertFromDecimal(decimal, 2),
        octal: convertFromDecimal(decimal, 8),
        hex: convertFromDecimal(decimal, 16),
        base32: convertFromDecimal(decimal, 32),
        base36: convertFromDecimal(decimal, 36),

        // Additional representations
        binaryFormatted: formatBinary(convertFromDecimal(decimal, 2)),
        byteRepresentation: getByteRepresentation(decimal),

        // Custom bases (3-7, 9, 11-15, 17-31, 33-35)
        customBases: {},
      };

      // Generate custom bases
      for (let base = 3; base <= 36; base++) {
        if (![2, 8, 10, 16, 32, 36].includes(base)) {
          newConversions.customBases[base] = convertFromDecimal(decimal, base);
        }
      }

      setConversions(newConversions);
    } catch (err) {
      setError(err.message);
      setConversions({});
    }
  }, [inputValue, inputBase]);

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value.toString());
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadExample = (example) => {
    switch (example) {
      case "binary":
        setInputValue("101010");
        setInputBase(2);
        break;
      case "hex":
        setInputValue("FF");
        setInputBase(16);
        break;
      case "octal":
        setInputValue("777");
        setInputBase(8);
        break;
      case "large":
        setInputValue("1000");
        setInputBase(10);
        break;
    }
  };

  const clearAll = () => {
    setInputValue("");
    setConversions({});
    setError("");
  };

  const getValidChars = (base) => {
    return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Number Base Converter
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Input Number
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                placeholder="Enter number..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Valid characters for base {inputBase}:{" "}
                {getValidChars(inputBase)}
              </div>
            </div>

            {/* Base Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Input Base
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="2"
                  max="36"
                  value={inputBase}
                  onChange={(e) => setInputBase(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-1">
                  {[2, 8, 10, 16, 32, 36].map((base) => (
                    <button
                      key={base}
                      onClick={() => setInputBase(base)}
                      className={`px-2 py-1 text-xs rounded ${
                        inputBase === base
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Base {base}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Quick Examples
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadExample("binary")}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Binary: 101010
            </button>
            <button
              onClick={() => loadExample("hex")}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Hex: FF
            </button>
            <button
              onClick={() => loadExample("octal")}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
            >
              Octal: 777
            </button>
            <button
              onClick={() => loadExample("large")}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Decimal: 1000
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
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

        {/* Results */}
        {Object.keys(conversions).length > 0 && !error && (
          <div className="space-y-6">
            {/* Main Conversions */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Common Base Conversions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonBases.map(({ value, label, description }) => (
                  <div
                    key={value}
                    className={`p-4 rounded-lg border ${
                      value === inputBase
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {label}
                      </span>
                      <button
                        onClick={() =>
                          copyValue(
                            value === 2
                              ? conversions.binary
                              : value === 8
                              ? conversions.octal
                              : value === 10
                              ? conversions.decimal
                              : value === 16
                              ? conversions.hex
                              : value === 32
                              ? conversions.base32
                              : conversions.base36
                          )
                        }
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="font-mono text-lg font-bold text-gray-900 dark:text-white mb-1 break-all">
                      {value === 2
                        ? conversions.binary
                        : value === 8
                        ? conversions.octal
                        : value === 10
                        ? conversions.decimal
                        : value === 16
                        ? conversions.hex
                        : value === 32
                        ? conversions.base32
                        : conversions.base36}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Binary Representations */}
            {conversions.binary && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Binary Representations
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Grouped Binary
                      </span>
                      <button
                        onClick={() => copyValue(conversions.binaryFormatted)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {conversions.binaryFormatted}
                    </code>
                  </div>

                  {conversions.byteRepresentation && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          32-bit Representation
                        </span>
                        <button
                          onClick={() =>
                            copyValue(conversions.byteRepresentation)
                          }
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <code className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {conversions.byteRepresentation}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Bases */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                All Bases (3-36)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {Object.entries(conversions.customBases).map(
                  ([base, value]) => (
                    <div
                      key={base}
                      className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Base {base}
                        </span>
                        <button
                          onClick={() => copyValue(value)}
                          className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <code className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                        {value}
                      </code>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Decimal Information */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Decimal Value Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-300">
                <div>
                  <strong>Decimal:</strong>{" "}
                  {conversions.decimal.toLocaleString()}
                </div>
                <div>
                  <strong>Scientific:</strong>{" "}
                  {conversions.decimal.toExponential(2)}
                </div>
                <div>
                  <strong>Bits needed:</strong> {conversions.binary.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Number Base Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Binary (Base 2):</strong> Used in computer systems
              </li>
              <li>
                • <strong>Octal (Base 8):</strong> Common in Unix file
                permissions
              </li>
              <li>
                • <strong>Decimal (Base 10):</strong> Standard human counting
                system
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Hexadecimal (Base 16):</strong> Used for colors,
                memory addresses
              </li>
              <li>
                • <strong>Base32/36:</strong> Used in encoding and URL
                shorteners
              </li>
              <li>
                • <strong>Custom bases:</strong> Any base from 2 to 36 supported
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;
