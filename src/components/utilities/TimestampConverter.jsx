import { useState, useEffect, useCallback } from "react";
import {
  format,
  parseISO,
  fromUnixTime,
  getUnixTime,
  formatISO,
  isValid,
  addDays,
  addHours,
  subDays,
  subHours,
} from "date-fns";

const TimestampConverter = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState("timestamp"); // timestamp, iso, human
  const [customFormat, setCustomFormat] = useState("yyyy-MM-dd HH:mm:ss");
  const [results, setResults] = useState({});
  const [error, setError] = useState("");

  // Common timestamp formats
  const commonFormats = [
    { label: "Default", value: "yyyy-MM-dd HH:mm:ss" },
    { label: "ISO 8601", value: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx" },
    { label: "US Format", value: "MM/dd/yyyy hh:mm:ss a" },
    { label: "European", value: "dd/MM/yyyy HH:mm:ss" },
    { label: "Date Only", value: "yyyy-MM-dd" },
    { label: "Time Only", value: "HH:mm:ss" },
    { label: "RFC 2822", value: "EEE, dd MMM yyyy HH:mm:ss xx" },
    { label: "Verbose", value: "EEEE, MMMM do, yyyy 'at' h:mm:ss a" },
  ];

  // MOVED: convertTimestamp function BEFORE the useEffect that uses it
  const convertTimestamp = useCallback(() => {
    try {
      setError("");
      let date; // declare once
      switch (inputType) {
        case "timestamp": {
          const ts = Number(inputValue.trim());
          if (Number.isNaN(ts)) throw new Error("Invalid timestamp");
          date = ts < 1e10 ? fromUnixTime(ts) : new Date(ts);
          break;
        }

        case "iso":
          date = parseISO(inputValue.trim());
          break;

        case "human":
          date = new Date(inputValue.trim());
          break;

        default:
          throw new Error("Unknown input type");
      }

      if (!isValid(date)) {
        throw new Error("Invalid date format");
      }

      // Generate all possible outputs
      const unixSeconds = getUnixTime(date);
      const unixMilliseconds = date.getTime();

      const newResults = {
        // Unix timestamps
        unixSeconds,
        unixMilliseconds,

        // ISO formats
        iso8601: formatISO(date),
        iso8601UTC: formatISO(date, { representation: "complete" }),

        // Common formats
        humanReadable: format(date, customFormat),
        utc: format(date, "yyyy-MM-dd HH:mm:ss 'UTC'"),
        rfc2822: format(date, "EEE, dd MMM yyyy HH:mm:ss xx"),

        // Components
        year: format(date, "yyyy"),
        month: format(date, "MM"),
        day: format(date, "dd"),
        hour: format(date, "HH"),
        minute: format(date, "mm"),
        second: format(date, "ss"),
        dayOfWeek: format(date, "EEEE"),
        dayOfYear: format(date, "d"),
        weekOfYear: format(date, "w"),

        // Relative calculations
        date: date,
      };

      setResults(newResults);
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
      setResults({});
    }
  }, [inputValue, inputType, customFormat]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-convert when input changes - NOW AFTER convertTimestamp is declared
  useEffect(() => {
    if (inputValue.trim()) {
      convertTimestamp();
    } else {
      setResults({});
      setError("");
    }
  }, [inputValue, inputType, customFormat, convertTimestamp]);

  const loadCurrentTime = () => {
    const now = new Date();
    setInputValue(getUnixTime(now).toString());
    setInputType("timestamp");
  };

  const loadSpecificTime = (timeFunction) => {
    const now = new Date();
    const newTime = timeFunction(now);
    setInputValue(getUnixTime(newTime).toString());
    setInputType("timestamp");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text.toString());
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearAll = () => {
    setInputValue("");
    setResults({});
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Timestamp ↔ Date Converter
        </h1>

        {/* Current Time Display */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Current Time
              </h3>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <div>Local: {format(currentTime, "yyyy-MM-dd HH:mm:ss")}</div>
                <div>
                  UTC: {format(currentTime, "yyyy-MM-dd HH:mm:ss 'UTC'")}
                </div>
                <div>Unix: {getUnixTime(currentTime)} seconds</div>
              </div>
            </div>
            <button
              onClick={loadCurrentTime}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Use Current Time
            </button>
          </div>
        </div>

        {/* Quick Time Buttons */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Quick Times
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadSpecificTime((date) => subDays(date, 1))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Yesterday
            </button>
            <button
              onClick={() => loadSpecificTime((date) => subHours(date, 1))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              1 Hour Ago
            </button>
            <button
              onClick={() => loadSpecificTime((date) => addHours(date, 1))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              1 Hour Later
            </button>
            <button
              onClick={() => loadSpecificTime((date) => addDays(date, 1))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Tomorrow
            </button>
            <button
              onClick={() => setInputValue("0")}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Unix Epoch
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Input Type
              </label>
              <select
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value);
                  setInputValue("");
                  setError("");
                }}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                "
              >
                <option value="timestamp">Unix Timestamp</option>
                <option value="iso">ISO 8601 Date</option>
                <option value="human">Human Readable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Output Format
              </label>
              <select
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                "
              >
                {commonFormats.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearAll}
                className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Clear All
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Input{" "}
              {inputType === "timestamp"
                ? "Timestamp"
                : inputType === "iso"
                ? "ISO Date"
                : "Date"}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                inputType === "timestamp"
                  ? "1609459200 or 1609459200000"
                  : inputType === "iso"
                  ? "2021-01-01T00:00:00.000Z"
                  : "January 1, 2021 or 2021-01-01"
              }
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                font-mono
              "
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            {/* Timestamp Formats */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Timestamp Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unix Seconds
                    </span>
                    <button
                      onClick={() => copyToClipboard(results.unixSeconds)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
                    {results.unixSeconds}
                  </code>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unix Milliseconds
                    </span>
                    <button
                      onClick={() => copyToClipboard(results.unixMilliseconds)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
                    {results.unixMilliseconds}
                  </code>
                </div>
              </div>
            </div>

            {/* Human Readable Formats */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Human Readable Formats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Custom Format
                    </span>
                    <button
                      onClick={() => copyToClipboard(results.humanReadable)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
                    {results.humanReadable}
                  </code>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ISO 8601
                    </span>
                    <button
                      onClick={() => copyToClipboard(results.iso8601)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1 break-all">
                    {results.iso8601}
                  </code>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      UTC
                    </span>
                    <button
                      onClick={() => copyToClipboard(results.utc)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
                    {results.utc}
                  </code>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      RFC 2822
                    </span>
                    <button
                      onClick={() => copyToClipboard(results.rfc2822)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1 break-all">
                    {results.rfc2822}
                  </code>
                </div>
              </div>
            </div>

            {/* Date Components */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Date Components
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "Year", value: results.year },
                  { label: "Month", value: results.month },
                  { label: "Day", value: results.day },
                  { label: "Hour", value: results.hour },
                  { label: "Minute", value: results.minute },
                  { label: "Second", value: results.second },
                  { label: "Day of Week", value: results.dayOfWeek },
                  { label: "Day of Year", value: results.dayOfYear },
                  { label: "Week of Year", value: results.weekOfYear },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center"
                  >
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {label}
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Timestamp Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Unix Timestamp:</strong> Seconds since January 1, 1970
                UTC
              </li>
              <li>
                • <strong>Milliseconds:</strong> Unix timestamp × 1000
              </li>
              <li>
                • <strong>ISO 8601:</strong> International date/time standard
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Auto-detection:</strong> Supports both seconds and
                milliseconds
              </li>
              <li>
                • <strong>Formats:</strong> Multiple output formats available
              </li>
              <li>
                • <strong>Timezone:</strong> All times displayed in local
                timezone
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;
