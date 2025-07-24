import { useState } from "react";

const TextCaseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [conversions, setConversions] = useState({});
  const [error, setError] = useState("");

  const convertText = (text) => {
    if (!text) return {};

    return {
      lowercase: text.toLowerCase(),
      uppercase: text.toUpperCase(),
      titleCase: text.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      ),
      sentenceCase: text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
      camelCase: text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, ""),
      pascalCase: text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
        .replace(/\s+/g, ""),
      snakeCase: text
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join("_"),
      kebabCase: text
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join("-"),
      constantCase: text
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toUpperCase())
        .join("_"),
      dotCase: text
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join("."),
      pathCase: text
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join("/"),
      alternatingCase: text
        .split("")
        .map((char, index) =>
          index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        )
        .join(""),
      inverseCase: text
        .split("")
        .map((char) =>
          char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase()
        )
        .join(""),
      randomCase: text
        .split("")
        .map((char) =>
          Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
        )
        .join(""),
    };
  };

  const processText = () => {
    try {
      setError("");

      if (!inputText.trim()) {
        setError("Please enter text to convert");
        setConversions({});
        return;
      }

      const results = convertText(inputText);
      setConversions(results);
    } catch (err) {
      setError(err.message);
      setConversions({});
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadSample = () => {
    setInputText(
      "Hello World! This is a SAMPLE text for testing different case conversions. It includes numbers123 and special-characters."
    );
    setError("");
    setConversions({});
  };

  const clearAll = () => {
    setInputText("");
    setConversions({});
    setError("");
  };

  const caseTypes = [
    {
      key: "lowercase",
      name: "lowercase",
      description: "All characters in lowercase",
      example: "hello world",
    },
    {
      key: "uppercase",
      name: "UPPERCASE",
      description: "All characters in uppercase",
      example: "HELLO WORLD",
    },
    {
      key: "titleCase",
      name: "Title Case",
      description: "First letter of each word capitalized",
      example: "Hello World",
    },
    {
      key: "sentenceCase",
      name: "Sentence case",
      description: "First letter of first word capitalized",
      example: "Hello world",
    },
    {
      key: "camelCase",
      name: "camelCase",
      description:
        "First word lowercase, subsequent words capitalized, no spaces",
      example: "helloWorld",
    },
    {
      key: "pascalCase",
      name: "PascalCase",
      description: "All words capitalized, no spaces",
      example: "HelloWorld",
    },
    {
      key: "snakeCase",
      name: "snake_case",
      description: "All lowercase with underscores",
      example: "hello_world",
    },
    {
      key: "kebabCase",
      name: "kebab-case",
      description: "All lowercase with hyphens",
      example: "hello-world",
    },
    {
      key: "constantCase",
      name: "CONSTANT_CASE",
      description: "All uppercase with underscores",
      example: "HELLO_WORLD",
    },
    {
      key: "dotCase",
      name: "dot.case",
      description: "All lowercase with dots",
      example: "hello.world",
    },
    {
      key: "pathCase",
      name: "path/case",
      description: "All lowercase with forward slashes",
      example: "hello/world",
    },
    {
      key: "alternatingCase",
      name: "aLtErNaTiNg CaSe",
      description: "Alternating uppercase and lowercase characters",
      example: "hElLo WoRlD",
    },
    {
      key: "inverseCase",
      name: "iNVERSE cASE",
      description: "Inverts the case of each character",
      example: "hELLO wORLD",
    },
    {
      key: "randomCase",
      name: "RaNdOm CaSe",
      description: "Randomly uppercase or lowercase each character",
      example: "HeLLo WoRLd",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Text Case Converter
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Input Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here to convert between different cases..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={processText}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Convert Text
          </button>
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

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Conversions Results */}
        {Object.keys(conversions).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Converted Text ({Object.keys(conversions).length} formats)
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {caseTypes.map(({ key, name, description, example }) => (
                <div
                  key={key}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {description}
                      </p>
                    </div>
                    <button
                      onClick={() => copyText(conversions[key])}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800 flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="mb-2">
                    <code className="block p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm font-mono text-gray-900 dark:text-white break-all">
                      {conversions[key]}
                    </code>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Example:{" "}
                    <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                      {example}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            {/* Text Statistics */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Text Statistics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800 dark:text-blue-300">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {inputText.length}
                  </div>
                  <div>Total Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {inputText.replace(/\s/g, "").length}
                  </div>
                  <div>Characters (no spaces)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {
                      inputText
                        .trim()
                        .split(/\s+/)
                        .filter((word) => word.length > 0).length
                    }
                  </div>
                  <div>Words</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {
                      inputText
                        .split(/[.!?]+/)
                        .filter((sentence) => sentence.trim().length > 0).length
                    }
                  </div>
                  <div>Sentences</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Examples */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
            Common Use Cases
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>camelCase:</strong> JavaScript variables and functions
              </li>
              <li>
                • <strong>PascalCase:</strong> Class names and components
              </li>
              <li>
                • <strong>snake_case:</strong> Python variables and database
                fields
              </li>
              <li>
                • <strong>kebab-case:</strong> CSS classes and HTML attributes
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>CONSTANT_CASE:</strong> Environment variables and
                constants
              </li>
              <li>
                • <strong>Title Case:</strong> Headings and proper nouns
              </li>
              <li>
                • <strong>sentence case:</strong> Regular sentences and
                descriptions
              </li>
              <li>
                • <strong>dot.case:</strong> File names and namespaces
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCaseConverter;
