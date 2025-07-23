import { useState } from "react";

const HARViewer = () => {
  const [harData, setHarData] = useState(null);
  const [error, setError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // all, xhr, js, css, img, doc

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setError("");
        const data = JSON.parse(e.target.result);

        // Validate HAR format
        if (!data.log || !data.log.entries) {
          throw new Error("Invalid HAR file format");
        }

        setHarData(data.log);
      } catch (err) {
        setError(`Failed to parse HAR file: ${err.message}`);
        setHarData(null);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    const sampleHAR = {
      version: "1.2",
      creator: { name: "Sample HAR", version: "1.0" },
      entries: [
        {
          startedDateTime: "2024-01-01T12:00:00.000Z",
          time: 150,
          request: {
            method: "GET",
            url: "https://example.com/api/data",
            headers: [
              { name: "Accept", value: "application/json" },
              { name: "User-Agent", value: "Browser/1.0" },
            ],
          },
          response: {
            status: 200,
            statusText: "OK",
            headers: [
              { name: "Content-Type", value: "application/json" },
              { name: "Content-Length", value: "1234" },
            ],
            content: { size: 1234, mimeType: "application/json" },
          },
          timings: {
            blocked: 10,
            dns: 20,
            connect: 30,
            send: 5,
            wait: 70,
            receive: 15,
          },
        },
        {
          startedDateTime: "2024-01-01T12:00:01.000Z",
          time: 89,
          request: {
            method: "GET",
            url: "https://example.com/styles.css",
            headers: [{ name: "Accept", value: "text/css" }],
          },
          response: {
            status: 200,
            statusText: "OK",
            headers: [{ name: "Content-Type", value: "text/css" }],
            content: { size: 567, mimeType: "text/css" },
          },
          timings: {
            blocked: 5,
            dns: 0,
            connect: 0,
            send: 2,
            wait: 67,
            receive: 15,
          },
        },
      ],
    };
    setHarData(sampleHAR);
    setError("");
  };

  const clearAll = () => {
    setHarData(null);
    setError("");
    setSelectedEntry(null);
    setFilter("all");
  };

  const getResourceType = (entry) => {
    const url = entry.request.url.toLowerCase();
    const mimeType = entry.response.content.mimeType?.toLowerCase() || "";

    if (mimeType.includes("json") || url.includes("api/")) return "xhr";
    if (mimeType.includes("javascript") || url.endsWith(".js")) return "js";
    if (mimeType.includes("css") || url.endsWith(".css")) return "css";
    if (mimeType.includes("image") || /\.(png|jpg|gif|svg|webp)/.test(url))
      return "img";
    if (mimeType.includes("html")) return "doc";
    return "other";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const filteredEntries =
    harData?.entries.filter((entry) => {
      if (filter === "all") return true;
      return getResourceType(entry) === filter;
    }) || [];

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300)
      return "text-green-600 dark:text-green-400";
    if (status >= 300 && status < 400)
      return "text-yellow-600 dark:text-yellow-400";
    if (status >= 400) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const totalSize =
    harData?.entries.reduce(
      (sum, entry) => sum + (entry.response.content.size || 0),
      0
    ) || 0;
  const totalTime =
    harData?.entries.reduce((sum, entry) => sum + entry.time, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          HAR File Viewer
        </h1>

        {/* Upload Controls */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload HAR File
            </label>
            <input
              type="file"
              accept=".har,.json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
          </div>

          <div className="flex gap-2">
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
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* HAR Analysis */}
        {harData && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {harData.entries.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Requests
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatSize(totalSize)}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Total Size
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDuration(totalTime)}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Total Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {harData.creator?.name || "Unknown"}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Creator
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "xhr", label: "XHR" },
                { key: "js", label: "JS" },
                { key: "css", label: "CSS" },
                { key: "img", label: "Images" },
                { key: "doc", label: "Documents" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {label} (
                  {
                    harData.entries.filter(
                      (e) => key === "all" || getResourceType(e) === key
                    ).length
                  }
                  )
                </button>
              ))}
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium">Method</th>
                    <th className="text-left p-2 font-medium">URL</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Size</th>
                    <th className="text-left p-2 font-medium">Time</th>
                    <th className="text-left p-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedEntry(entry)}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="p-2 font-mono">{entry.request.method}</td>
                      <td
                        className="p-2 truncate max-w-xs"
                        title={entry.request.url}
                      >
                        {entry.request.url}
                      </td>
                      <td
                        className={`p-2 font-mono ${getStatusColor(
                          entry.response.status
                        )}`}
                      >
                        {entry.response.status}
                      </td>
                      <td className="p-2 font-mono">
                        {formatSize(entry.response.content.size || 0)}
                      </td>
                      <td className="p-2 font-mono">
                        {formatDuration(entry.time)}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                          {getResourceType(entry)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Request Details */}
            {selectedEntry && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Request Details
                  </h3>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Request */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Request
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>URL:</strong> {selectedEntry.request.url}
                      </div>
                      <div>
                        <strong>Method:</strong> {selectedEntry.request.method}
                      </div>
                      <div>
                        <strong>Headers:</strong>
                      </div>
                      <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                        {selectedEntry.request.headers
                          .map((h) => `${h.name}: ${h.value}`)
                          .join("\n")}
                      </pre>
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Response
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Status:</strong> {selectedEntry.response.status}{" "}
                        {selectedEntry.response.statusText}
                      </div>
                      <div>
                        <strong>Size:</strong>{" "}
                        {formatSize(selectedEntry.response.content.size || 0)}
                      </div>
                      <div>
                        <strong>Headers:</strong>
                      </div>
                      <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                        {selectedEntry.response.headers
                          .map((h) => `${h.name}: ${h.value}`)
                          .join("\n")}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Timings */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Timings
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                    {Object.entries(selectedEntry.timings).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-2 bg-white dark:bg-gray-800 rounded"
                        >
                          <div className="font-mono">
                            {formatDuration(value)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {key}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            About HAR Files
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p>• HAR (HTTP Archive) files contain recorded network activity</p>
            <p>
              • Export from browser DevTools → Network tab → "Save all as HAR"
            </p>
            <p>
              • Useful for performance analysis and debugging network issues
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HARViewer;
