import { useState } from "react";
import {
  createMD5,
  createSHA1,
  createSHA256,
  createSHA512,
  createSHA3,
  createKeccak,
} from "hash-wasm";

const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState("text"); // text or file

  const algorithms = [
    {
      key: "md5",
      name: "MD5",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    {
      key: "sha1",
      name: "SHA-1",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    {
      key: "sha256",
      name: "SHA-256",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    {
      key: "sha512",
      name: "SHA-512",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      key: "sha3-256",
      name: "SHA3-256",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    {
      key: "keccak-256",
      name: "Keccak-256",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    },
  ];

  const generateHashes = async (data) => {
    setIsLoading(true);
    try {
      const results = {};

      // Create hash instances
      const md5 = await createMD5();
      const sha1 = await createSHA1();
      const sha256 = await createSHA256();
      const sha512 = await createSHA512();
      const sha3_256 = await createSHA3(256);
      const keccak256 = await createKeccak(256);

      if (typeof data === "string") {
        results.md5 = md5.update(data).digest("hex");
        results.sha1 = sha1.update(data).digest("hex");
        results.sha256 = sha256.update(data).digest("hex");
        results.sha512 = sha512.update(data).digest("hex");
        results["sha3-256"] = sha3_256.update(data).digest("hex");
        results["keccak-256"] = keccak256.update(data).digest("hex");
      } else {
        // Handle file data (Uint8Array)
        results.md5 = md5.update(data).digest("hex");
        results.sha1 = sha1.update(data).digest("hex");
        results.sha256 = sha256.update(data).digest("hex");
        results.sha512 = sha512.update(data).digest("hex");
        results["sha3-256"] = sha3_256.update(data).digest("hex");
        results["keccak-256"] = keccak256.update(data).digest("hex");
      }

      setHashes(results);
    } catch (error) {
      console.error("Hash generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = () => {
    if (input.trim()) {
      generateHashes(input);
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        generateHashes(uint8Array);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const copyToClipboard = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      // Add success feedback
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Hash Generator
        </h1>

        {/* Input Mode Toggle */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={() => setInputMode("text")}
              className={`
                flex-1 py-2 px-4 rounded text-sm font-medium transition-colors
                ${
                  inputMode === "text"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              Text Input
            </button>
            <button
              onClick={() => setInputMode("file")}
              className={`
                flex-1 py-2 px-4 rounded text-sm font-medium transition-colors
                ${
                  inputMode === "file"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              File Upload
            </button>
          </div>
        </div>

        {/* Input Section */}
        {inputMode === "text" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text to Hash
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to generate hashes..."
                rows={4}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  resize-none
                "
              />
            </div>
            <button
              onClick={handleTextInput}
              disabled={!input.trim() || isLoading}
              className="
                px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                text-white rounded-lg transition-colors
                focus:ring-2 focus:ring-blue-500 focus:outline-none
                disabled:cursor-not-allowed
              "
            >
              {isLoading ? "Generating..." : "Generate Hashes"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileInput}
                className="
                  block w-full text-sm text-gray-900 dark:text-white
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200
                  dark:hover:file:bg-blue-800
                "
              />
            </div>
          </div>
        )}

        {/* Results */}
        {Object.keys(hashes).length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Hashes
            </h3>

            {algorithms.map(
              ({ key, name, color }) =>
                hashes[key] && (
                  <div
                    key={key}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${color}`}
                      >
                        {name}
                      </span>
                      <button
                        onClick={() => copyToClipboard(hashes[key])}
                        className="
                        px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 
                        text-gray-700 dark:text-gray-300 rounded
                        hover:bg-gray-300 dark:hover:bg-gray-500
                      "
                      >
                        Copy
                      </button>
                    </div>
                    <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {hashes[key]}
                    </code>
                  </div>
                )
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Hash Algorithm Information
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>
              • <strong>MD5:</strong> 128-bit hash (not cryptographically
              secure)
            </li>
            <li>
              • <strong>SHA-1:</strong> 160-bit hash (deprecated for security)
            </li>
            <li>
              • <strong>SHA-256:</strong> 256-bit secure hash (recommended)
            </li>
            <li>
              • <strong>SHA-512:</strong> 512-bit secure hash
            </li>
            <li>
              • <strong>SHA3-256:</strong> Latest SHA-3 standard
            </li>
            <li>
              • <strong>Keccak-256:</strong> Used in Ethereum blockchain
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;
