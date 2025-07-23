import { useState } from "react";

const ENVTOMLConverter = () => {
  const [envInput, setEnvInput] = useState("");
  const [tomlOutput, setTomlOutput] = useState("");
  const [error, setError] = useState("");
  const [context, setContext] = useState("production");
  const [includeComments, setIncludeComments] = useState(true);
  const [parsedVars, setParsedVars] = useState([]);

  const parseEnvFile = (envContent) => {
    const lines = envContent.split("\n");
    const variables = [];
    let currentComment = "";

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle comments
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        if (trimmedLine.startsWith("#")) {
          currentComment = trimmedLine.substring(1).trim();
        }
        return;
      }

      // Parse environment variable
      const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        const [, key, value] = match;

        // Remove quotes if present
        let cleanValue = value;
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          cleanValue = value.slice(1, -1);
        }

        variables.push({
          key: key.trim(),
          value: cleanValue,
          comment: currentComment,
          lineNumber: index + 1,
          originalLine: line,
        });

        currentComment = ""; // Reset comment after use
      } else if (trimmedLine) {
        // Invalid line format
        throw new Error(
          `Invalid environment variable format at line ${index + 1}: ${line}`
        );
      }
    });

    return variables;
  };

  // Helper function to properly escape TOML values
  const escapeTomlValue = (value) => {
    // Handle boolean values
    if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
      return value.toLowerCase();
    }

    // Handle numeric values (integers and floats)
    if (/^\d+$/.test(value) || /^\d+\.\d+$/.test(value)) {
      return value;
    }

    // Handle string values - escape special characters for TOML
    let escaped = value
      .replace(/\\/g, "\\\\") // Escape backslashes first
      .replace(/"/g, '\\"') // Escape double quotes
      .replace(/\n/g, "\\n") // Escape newlines
      .replace(/\r/g, "\\r") // Escape carriage returns
      .replace(/\t/g, "\\t") // Escape tabs
      .replace(/\b/g, "\\b") // Escape backspace
      .replace(/\f/g, "\\f"); // Escape form feed

    return `"${escaped}"`;
  };

  const generateNetlifyTOML = (variables, environmentContext) => {
    let tomlString = "";

    if (includeComments) {
      tomlString += `# Netlify configuration file\n`;
      tomlString += `# Generated from .env file\n`;
      tomlString += `# Environment: ${environmentContext}\n`;
      tomlString += `# Generated on: ${new Date().toLocaleDateString()}\n\n`;
    }

    // Build section
    tomlString += "[build]\n";

    if (includeComments) {
      tomlString += "  # Build environment variables\n";
    }

    tomlString += "  [build.environment]\n";

    variables.forEach((variable) => {
      if (includeComments && variable.comment) {
        tomlString += `    # ${variable.comment}\n`;
      }

      const tomlValue = escapeTomlValue(variable.value);
      tomlString += `    ${variable.key} = ${tomlValue}\n`;
    });

    // Add context-specific sections if needed
    if (environmentContext !== "production") {
      tomlString += `\n`;
      if (includeComments) {
        tomlString += `# Context-specific overrides for ${environmentContext}\n`;
      }
      tomlString += `[context.${environmentContext}]\n`;
      tomlString += `  [context.${environmentContext}.environment]\n`;

      variables.forEach((variable) => {
        const tomlValue = escapeTomlValue(variable.value);
        tomlString += `    ${variable.key} = ${tomlValue}\n`;
      });
    }

    return tomlString;
  };

  const convertToTOML = () => {
    try {
      setError("");

      if (!envInput.trim()) {
        setError("Please enter environment variables to convert");
        setTomlOutput("");
        setParsedVars([]);
        return;
      }

      // Parse the .env content
      const variables = parseEnvFile(envInput);
      setParsedVars(variables);

      if (variables.length === 0) {
        setError("No valid environment variables found");
        setTomlOutput("");
        return;
      }

      // Generate Netlify TOML
      const toml = generateNetlifyTOML(variables, context);
      setTomlOutput(toml);
    } catch (err) {
      setError(err.message);
      setTomlOutput("");
      setParsedVars([]);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tomlOutput);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadTOML = () => {
    const blob = new Blob([tomlOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "netlify.toml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleEnv = () => {
    const sample = `# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
DATABASE_POOL_SIZE=20

# API Keys
API_KEY=abc123def456ghi789
STRIPE_SECRET_KEY=sk_test_123456789
STRIPE_PUBLISHABLE_KEY=pk_test_987654321

# Application Settings
NODE_ENV=production
PORT=3000
DEBUG=false
LOG_LEVEL=info

# External Services
REDIS_URL=redis://localhost:6379
SENDGRID_API_KEY=SG.1234567890.abcdefghijklmnop
JWT_SECRET=super-secret-jwt-key-here

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_BETA_FEATURES=false`;

    setEnvInput(sample);
    setError("");
    setTomlOutput("");
    setParsedVars([]);
  };

  const clearAll = () => {
    setEnvInput("");
    setTomlOutput("");
    setError("");
    setParsedVars([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ENV → Netlify TOML Converter
        </h1>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Environment Context
            </label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="preview">Preview</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include Comments
              </span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={convertToTOML}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              Convert to TOML
            </button>
          </div>
        </div>

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ENV Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Environment Variables (.env format)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={loadSampleEnv}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  Load Sample
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={envInput}
              onChange={(e) => setEnvInput(e.target.value)}
              placeholder={`# Database
DATABASE_URL=postgresql://localhost:5432/db
API_KEY=your-api-key
NODE_ENV=production
DEBUG=false
PORT=3000`}
              rows={18}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TOML Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Netlify TOML Output
              </label>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!tomlOutput}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy
                </button>
                <button
                  onClick={downloadTOML}
                  disabled={!tomlOutput}
                  className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={tomlOutput}
              rows={18}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Parsed Variables Summary */}
        {parsedVars.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
              Conversion Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800 dark:text-green-300">
              <div>
                <strong>Variables Found:</strong> {parsedVars.length}
              </div>
              <div>
                <strong>Comments:</strong>{" "}
                {parsedVars.filter((v) => v.comment).length}
              </div>
              <div>
                <strong>Context:</strong> {context}
              </div>
            </div>

            <div className="mt-3">
              <strong className="text-green-900 dark:text-green-200">
                Variables:
              </strong>
              <div className="mt-1 flex flex-wrap gap-1">
                {parsedVars.map((variable, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs font-mono"
                  >
                    {variable.key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
            How to Use Netlify TOML
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div className="space-y-2">
              <div>
                <strong>1. Copy/Download:</strong> Get the generated TOML
                configuration
              </div>
              <div>
                <strong>2. Save as netlify.toml:</strong> Place in your project
                root
              </div>
              <div>
                <strong>3. Deploy:</strong> Netlify will automatically use the
                config
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <strong>Environment Contexts:</strong> Production, staging,
                preview
              </div>
              <div>
                <strong>Build Variables:</strong> Available during build process
              </div>
              <div>
                <strong>Comments:</strong> Preserved for documentation
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded">
            <strong className="text-blue-900 dark:text-blue-200">Note:</strong>
            <span className="text-blue-800 dark:text-blue-300 ml-1">
              Environment variables containing secrets should be set in
              Netlify's dashboard for security.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ENVTOMLConverter;
