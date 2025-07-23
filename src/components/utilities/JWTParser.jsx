import { useState } from "react";

const base64UrlDecode = (input) => {
  // Replace URL-safe chars, pad with '='
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  // atob decodes to binary string; decodeURIComponent handles UTF-8
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    throw new Error("Invalid Base64 string");
  }
};

const JWTParser = () => {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const decodeJWT = () => {
    setError("");
    setHeader(null);
    setPayload(null);
    setSignature("");
    try {
      if (!token.trim()) throw new Error("Please enter a JWT");
      const parts = token.trim().split(".");
      if (parts.length < 2)
        throw new Error("Token must have two or three parts");

      // Decode
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      const sig = parts[2] || "";

      setHeader(decodedHeader);
      setPayload(decodedPayload);
      setSignature(sig);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSample = () => {
    setToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9." +
        "TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
    );
    setError("");
    setHeader(null);
    setPayload(null);
    setSignature("");
  };

  const clearAll = () => {
    setToken("");
    setHeader(null);
    setPayload(null);
    setSignature("");
    setError("");
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(
        typeof text === "object" ? JSON.stringify(text, null, 2) : text
      );
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const downloadJSON = () => {
    const data = { header, payload, signature };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jwt.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          JWT Parser
        </h1>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            JWT Token
          </label>
          <textarea
            rows={3}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter JWT here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={decodeJWT}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Decode
          </button>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Load Sample
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
          {header && (
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Download JSON
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Output */}
        {header && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Header
              </h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <pre className="text-sm font-mono text-gray-900 dark:text-gray-100 overflow-auto">
                  {JSON.stringify(header, null, 2)}
                </pre>
                <button
                  onClick={() => copyText(header)}
                  className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  Copy Header
                </button>
              </div>
            </div>

            {/* Payload */}
            <div>
              <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Payload
              </h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <pre className="text-sm font-mono text-gray-900 dark:text-gray-100 overflow-auto">
                  {JSON.stringify(payload, null, 2)}
                </pre>
                <button
                  onClick={() => copyText(payload)}
                  className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  Copy Payload
                </button>
              </div>
            </div>

            {/* Signature */}
            <div>
              <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Signature
              </h2>
              <div className="flex items-center space-x-2">
                <code className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                  {signature || "(none)"}
                </code>
                <button
                  onClick={() => copyText(signature)}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JWTParser;
