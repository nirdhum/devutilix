import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4, v1 as uuidv1, v3 as uuidv3, v5 as uuidv5 } from "uuid";

const UUIDGenerator = () => {
  const [uuids, setUuids] = useState({
    v1: "",
    v4: "",
    v3: "",
    v5: "",
  });
  const [customOptions, setCustomOptions] = useState({
    namespace: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // DNS namespace
    name: "example.com",
    quantity: 1,
    format: "standard",
  });
  const [bulkUuids, setBulkUuids] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("v4");

  // Generate individual UUIDs
  const generateUUIDs = useCallback(() => {
    try {
      const newUuids = {
        v1: uuidv1(),
        v4: uuidv4(),
        v3: uuidv3(customOptions.name, customOptions.namespace),
        v5: uuidv5(customOptions.name, customOptions.namespace),
      };
      setUuids(newUuids);
    } catch (error) {
      console.error("UUID generation failed:", error);
    }
  }, [customOptions.name, customOptions.namespace]); // Dependencies for generateUUIDs

  // Generate bulk UUIDs
  const generateBulkUUIDs = () => {
    const generated = [];
    for (let i = 0; i < customOptions.quantity; i++) {
      let uuid;
      switch (selectedVersion) {
        case "v1":
          uuid = uuidv1();
          break;
        case "v3":
          uuid = uuidv3(`${customOptions.name}-${i}`, customOptions.namespace);
          break;
        case "v5":
          uuid = uuidv5(`${customOptions.name}-${i}`, customOptions.namespace);
          break;
        case "v4":
        default:
          uuid = uuidv4();
          break;
      }

      // Format UUID based on selected format
      const formattedUuid = formatUuid(uuid, customOptions.format);
      generated.push(formattedUuid);
    }
    setBulkUuids(generated);
  };

  const formatUuid = (uuid, format) => {
    switch (format) {
      case "uppercase":
        return uuid.toUpperCase();
      case "lowercase":
        return uuid.toLowerCase();
      case "no-hyphens":
        return uuid.replace(/-/g, "");
      case "braces":
        return `{${uuid}}`;
      case "quotes":
        return `"${uuid}"`;
      default:
        return uuid;
    }
  };

  // Auto-generate on component mount
  useEffect(() => {
    generateUUIDs();
  }, [generateUUIDs]);

  // Regenerate name-based UUIDs when options change
  useEffect(() => {
    if (customOptions.name && customOptions.namespace) {
      setUuids((currentUuids) => ({
        ...currentUuids, // Use functional update to avoid dependency
        v3: uuidv3(customOptions.name, customOptions.namespace),
        v5: uuidv5(customOptions.name, customOptions.namespace),
      }));
    }
  }, [customOptions.name, customOptions.namespace]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyAllBulk = async () => {
    const allUuids = bulkUuids.join("\n");
    await copyToClipboard(allUuids);
  };

  const downloadBulkUuids = () => {
    const blob = new Blob([bulkUuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${selectedVersion}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uuidVersions = [
    {
      version: "v1",
      name: "UUID v1",
      description: "Time-based UUID using MAC address and timestamp",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      version: "v4",
      name: "UUID v4",
      description: "Random UUID (most commonly used)",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      version: "v3",
      name: "UUID v3",
      description: "Name-based UUID using MD5 hashing",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    },
    {
      version: "v5",
      name: "UUID v5",
      description: "Name-based UUID using SHA-1 hashing",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          UUID Generator
        </h1>

        {/* Single UUIDs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generate Single UUIDs
            </h2>
            <button
              onClick={generateUUIDs}
              className="
                px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors
              "
            >
              Generate New UUIDs
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {uuidVersions.map(({ version, name, description, color }) => (
              <div
                key={version}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${color}`}
                  >
                    {name}
                  </span>
                  <button
                    onClick={() => copyToClipboard(uuids[version])}
                    className="
                      px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 
                      text-gray-700 dark:text-gray-300 rounded
                      hover:bg-gray-300 dark:hover:bg-gray-500
                    "
                  >
                    Copy
                  </button>
                </div>
                <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 break-all mb-2">
                  {uuids[version]}
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Name-based UUID Options */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Options for Name-based UUIDs (v3 & v5)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Namespace
              </label>
              <select
                value={customOptions.namespace}
                onChange={(e) =>
                  setCustomOptions((prev) => ({
                    ...prev,
                    namespace: e.target.value,
                  }))
                }
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                "
              >
                <option value="6ba7b810-9dad-11d1-80b4-00c04fd430c8">
                  DNS Namespace
                </option>
                <option value="6ba7b811-9dad-11d1-80b4-00c04fd430c8">
                  URL Namespace
                </option>
                <option value="6ba7b812-9dad-11d1-80b4-00c04fd430c8">
                  ISO OID Namespace
                </option>
                <option value="6ba7b814-9dad-11d1-80b4-00c04fd430c8">
                  X.500 DN Namespace
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name/String
              </label>
              <input
                type="text"
                value={customOptions.name}
                onChange={(e) =>
                  setCustomOptions((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter name for UUID generation"
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                "
              />
            </div>
          </div>
        </div>

        {/* Bulk Generation Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bulk UUID Generation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                UUID Version
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                "
              >
                <option value="v1">UUID v1 (Time-based)</option>
                <option value="v4">UUID v4 (Random)</option>
                <option value="v3">UUID v3 (Name-based MD5)</option>
                <option value="v5">UUID v5 (Name-based SHA-1)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={customOptions.quantity}
                onChange={(e) =>
                  setCustomOptions((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={customOptions.format}
                onChange={(e) =>
                  setCustomOptions((prev) => ({
                    ...prev,
                    format: e.target.value,
                  }))
                }
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                "
              >
                <option value="standard">Standard (lowercase)</option>
                <option value="uppercase">Uppercase</option>
                <option value="no-hyphens">No Hyphens</option>
                <option value="braces">With Braces {}</option>
                <option value="quotes">With Quotes ""</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={generateBulkUUIDs}
              className="
                px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors
              "
            >
              Generate {customOptions.quantity} UUIDs
            </button>

            {bulkUuids.length > 0 && (
              <>
                <button
                  onClick={copyAllBulk}
                  className="
                    px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg
                    focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors
                  "
                >
                  Copy All
                </button>
                <button
                  onClick={downloadBulkUuids}
                  className="
                    px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors
                  "
                >
                  Download
                </button>
              </>
            )}
          </div>

          {bulkUuids.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generated UUIDs ({bulkUuids.length})
              </label>
              <textarea
                value={bulkUuids.join("\n")}
                readOnly
                rows={Math.min(bulkUuids.length + 1, 15)}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                  font-mono text-sm resize-none
                "
              />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            UUID Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>UUID v1:</strong> Time and node-based, contains MAC
                address
              </li>
              <li>
                • <strong>UUID v4:</strong> Random, most commonly used
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>UUID v3:</strong> Name-based using MD5 hash
              </li>
              <li>
                • <strong>UUID v5:</strong> Name-based using SHA-1 hash
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UUIDGenerator;
