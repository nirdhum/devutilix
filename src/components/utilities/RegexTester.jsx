import { useState, useEffect } from "react";

const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const availableFlags = [
    { key: "g", label: "Global", description: "Find all matches" },
    { key: "i", label: "Ignore Case", description: "Case insensitive" },
    { key: "m", label: "Multiline", description: "^$ match line boundaries" },
    { key: "s", label: "Dotall", description: ". matches newlines" },
    { key: "u", label: "Unicode", description: "Full unicode support" },
    { key: "y", label: "Sticky", description: "Match from lastIndex only" },
  ];

  // Fixed: Using useEffect instead of useMemo for side effects
  useEffect(() => {
    if (!pattern || !testText) {
      setResults(null);
      setError("");
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;

      if (flags.includes("g")) {
        // Global flag - find all matches
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {},
          });

          // Prevent infinite loop on zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        // Single match
        match = regex.exec(testText);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {},
          });
        }
      }

      setResults({
        regex,
        matches,
        isValid: true,
      });
      setError("");
    } catch (err) {
      setError(`Invalid regex: ${err.message}`);
      setResults(null);
    }
  }, [pattern, flags, testText]);

  const highlightMatches = () => {
    if (!results || !results.matches.length) return testText;

    let highlighted = testText;
    const matches = [...results.matches].sort((a, b) => b.index - a.index);

    matches.forEach((match) => {
      const before = highlighted.slice(0, match.index);
      const matchText = highlighted.slice(
        match.index,
        match.index + match.match.length
      );
      const after = highlighted.slice(match.index + match.match.length);
      highlighted = `${before}<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${matchText}</mark>${after}`;
    });

    return highlighted;
  };

  const toggleFlag = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  const loadSample = () => {
    setPattern("\\b\\w+@\\w+\\.\\w+\\b");
    setFlags("gi");
    setTestText("Contact us at john@example.com or support@test.org for help.");
    setError("");
  };

  const clearAll = () => {
    setPattern("");
    setFlags("g");
    setTestText("");
    setResults(null);
    setError("");
  };

  const copyResults = async () => {
    if (!results) return;
    const data = {
      pattern,
      flags,
      matches: results.matches,
      totalMatches: results.matches.length,
    };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Regex Tester
        </h1>

        {/* Pattern Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Regular Expression Pattern
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 text-lg">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500 dark:text-gray-400 text-lg">
              /{flags}
            </span>
          </div>
        </div>

        {/* Flags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Flags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableFlags.map(({ key, label, description }) => (
              <button
                key={key}
                onClick={() => toggleFlag(key)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  flags.includes(key)
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
                title={description}
              >
                {key} - {label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Test Text
          </label>
          <textarea
            rows={6}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test against the regex..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
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
            Clear All
          </button>
          {results && (
            <button
              onClick={copyResults}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              Copy Results
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Match Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Match Summary
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <div>
                  Pattern:{" "}
                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                    /{pattern}/{flags}
                  </code>
                </div>
                <div>
                  Matches found: <strong>{results.matches.length}</strong>
                </div>
              </div>
            </div>

            {/* Highlighted Text */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Highlighted Matches
              </h3>
              <div
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 whitespace-pre-wrap font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: highlightMatches() }}
              />
            </div>

            {/* Match Details */}
            {results.matches.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Match Details
                </h3>
                <div className="space-y-3">
                  {results.matches.map((match, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Match #{index + 1}:</strong>
                          <div className="font-mono bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded mt-1">
                            {match.match}
                          </div>
                        </div>
                        <div>
                          <strong>Position:</strong>
                          <div className="font-mono">Index {match.index}</div>
                        </div>
                        <div>
                          <strong>Length:</strong>
                          <div className="font-mono">
                            {match.match.length} characters
                          </div>
                        </div>
                      </div>

                      {/* Capture Groups */}
                      {match.groups.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <strong className="text-sm">Capture Groups:</strong>
                          <div className="mt-1 space-y-1">
                            {match.groups.map((group, groupIndex) => (
                              <div key={groupIndex} className="text-sm">
                                <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">
                                  ${groupIndex + 1}:
                                </span>
                                <span className="font-mono ml-2">
                                  {group || "(empty)"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Named Groups */}
                      {Object.keys(match.namedGroups).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <strong className="text-sm">Named Groups:</strong>
                          <div className="mt-1 space-y-1">
                            {Object.entries(match.namedGroups).map(
                              ([name, value]) => (
                                <div key={name} className="text-sm">
                                  <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">
                                    {name}:
                                  </span>
                                  <span className="font-mono ml-2">
                                    {value || "(empty)"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Regex Tips
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p>
              • Use <code>\d</code> for digits, <code>\w</code> for word
              characters, <code>\s</code> for whitespace
            </p>
            <p>
              • <code>+</code> means one or more, <code>*</code> means zero or
              more, <code>?</code> means optional
            </p>
            <p>
              • Use parentheses <code>()</code> to create capture groups
            </p>
            <p>
              • Use named groups <code>(?&lt;name&gt;pattern)</code> for better
              organization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
