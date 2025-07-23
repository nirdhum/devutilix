import { useState } from "react";

const Base64Converter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode"); // encode or decode
  const [error, setError] = useState("");
  const [inputType, setInputType] = useState("text"); // text or file

  const handleTextConversion = () => {
    try {
      setError("");

      if (!input.trim()) {
        setError("Please provide input to convert");
        return;
      }

      let result;

      if (mode === "encode") {
        // Encode text to Base64
        result = btoa(unescape(encodeURIComponent(input)));
      } else {
        // Decode Base64 to text
        result = decodeURIComponent(escape(atob(input)));
      }

      setOutput(result);
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
      setOutput("");
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          setOutput(base64);
          setInput(`File: ${file.name} (${formatFileSize(file.size)})`);
          setError("");
        } catch (err) {
          setError(`File encoding failed: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // Add success feedback if needed
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encode" ? "encoded.base64" : "decoded.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Base64 Encode/Decode
          </h1>

          <div className="flex items-center space-x-4">
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setOutput("");
                setError("");
              }}
              className="
                px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            >
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </select>
          </div>
        </div>

        {/* Input Type Toggle */}
        {mode === "encode" && (
          <div className="mb-6">
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
              <button
                onClick={() => setInputType("text")}
                className={`
                  flex-1 py-2 px-4 rounded text-sm font-medium transition-colors
                  ${
                    inputType === "text"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                Text Input
              </button>
              <button
                onClick={() => setInputType("file")}
                className={`
                  flex-1 py-2 px-4 rounded text-sm font-medium transition-colors
                  ${
                    inputType === "file"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                File Upload
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
              </label>
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear All
              </button>
            </div>

            {mode === "encode" && inputType === "file" ? (
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleFileInput}
                  className="
                    block w-full text-sm text-gray-900 dark:text-white
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                    file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200
                  "
                />
                {input && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    {input}
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? "Enter text to encode to Base64..."
                    : "Enter Base64 string to decode..."
                }
                rows={15}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  font-mono text-sm resize-none
                "
              />
            )}
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!output}
                  className="
                    px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 
                    text-gray-700 dark:text-gray-300 rounded
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  disabled={!output}
                  className="
                    px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 
                    text-gray-700 dark:text-gray-300 rounded
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              rows={15}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                font-mono text-sm resize-none
              "
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleTextConversion}
            disabled={inputType === "file"}
            className="
              px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            About Base64 Encoding
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Base64 is a binary-to-text encoding scheme</li>
            <li>• Commonly used for embedding binary data in text formats</li>
            <li>
              • Safe for transmission over text-based protocols like email
            </li>
            <li>• Increases data size by approximately 33%</li>
            <li>• Supports both text and file encoding</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Base64Converter;
