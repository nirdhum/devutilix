import { useState } from "react";
import { format } from "sql-formatter";

const SQLFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    language: "sql",
    indent: "  ", // 2 spaces
    uppercase: false,
    linesBetweenQueries: 1,
    denseOperators: false,
    newlineBeforeOpeningKeyword: false,
  });

  const sqlDialects = [
    { value: "sql", label: "Standard SQL", description: "ANSI SQL standard" },
    { value: "mysql", label: "MySQL", description: "MySQL-specific syntax" },
    {
      value: "postgresql",
      label: "PostgreSQL",
      description: "PostgreSQL-specific syntax",
    },
    { value: "sqlite", label: "SQLite", description: "SQLite-specific syntax" },
    {
      value: "mariadb",
      label: "MariaDB",
      description: "MariaDB-specific syntax",
    },
    {
      value: "bigquery",
      label: "BigQuery",
      description: "Google BigQuery syntax",
    },
    {
      value: "snowflake",
      label: "Snowflake",
      description: "Snowflake Data Cloud syntax",
    },
    { value: "spark", label: "Apache Spark", description: "Spark SQL syntax" },
  ];

  const formatSQL = () => {
    try {
      setError("");

      if (!input.trim()) {
        throw new Error("Please enter SQL to format");
      }

      const formattedSQL = format(input, {
        language: settings.language,
        indent: settings.indent,
        uppercase: settings.uppercase,
        linesBetweenQueries: settings.linesBetweenQueries,
        denseOperators: settings.denseOperators,
        newlineBeforeOpeningKeyword: settings.newlineBeforeOpeningKeyword,
      });

      setOutput(formattedSQL);
    } catch (err) {
      setError(err.message);
      setOutput("");
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadSample = () => {
    const sample = `SELECT u.id, u.username, u.email, p.title AS profile_title, COUNT(o.id) AS order_count, SUM(o.total_amount) AS total_spent FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2023-01-01' AND u.status = 'active' GROUP BY u.id, u.username, u.email, p.title HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC, u.username ASC LIMIT 100;

INSERT INTO products (name, description, price, category_id, stock_quantity, created_at) VALUES ('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 1, 50, NOW()), ('Gaming Mouse', 'Precision gaming mouse with RGB lighting', 79.99, 2, 75, NOW()), ('Mechanical Keyboard', 'Cherry MX Blue switches with backlight', 129.99, 2, 30, NOW());

UPDATE inventory SET stock_quantity = stock_quantity - 1, last_updated = CURRENT_TIMESTAMP WHERE product_id IN (SELECT id FROM products WHERE category = 'electronics' AND stock_quantity > 0);

CREATE TABLE user_sessions (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, session_token VARCHAR(255) UNIQUE NOT NULL, ip_address INET, user_agent TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expires_at TIMESTAMP NOT NULL, is_active BOOLEAN DEFAULT TRUE, INDEX idx_user_sessions_user_id (user_id), INDEX idx_user_sessions_token (session_token), INDEX idx_user_sessions_expires (expires_at), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);`;

    setInput(sample);
    setOutput("");
    setError("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const swapInputOutput = () => {
    if (output) {
      setInput(output);
      setOutput("");
    }
  };

  const getQueryInfo = () => {
    if (!input) return null;

    const queries = input.split(";").filter((q) => q.trim());
    const selectCount = (input.match(/\bSELECT\b/gi) || []).length;
    const insertCount = (input.match(/\bINSERT\b/gi) || []).length;
    const updateCount = (input.match(/\bUPDATE\b/gi) || []).length;
    const deleteCount = (input.match(/\bDELETE\b/gi) || []).length;
    const createCount = (input.match(/\bCREATE\b/gi) || []).length;
    const alterCount = (input.match(/\bALTER\b/gi) || []).length;
    const dropCount = (input.match(/\bDROP\b/gi) || []).length;

    return {
      totalQueries: queries.length,
      selectQueries: selectCount,
      insertQueries: insertCount,
      updateQueries: updateCount,
      deleteQueries: deleteCount,
      createQueries: createCount,
      alterQueries: alterCount,
      dropQueries: dropCount,
      totalLines: input.split("\n").length,
      totalCharacters: input.length,
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          SQL Formatter
        </h1>

        {/* Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Database Dialect */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SQL Dialect
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {sqlDialects.map((dialect) => (
                <option key={dialect.value} value={dialect.value}>
                  {dialect.label} - {dialect.description}
                </option>
              ))}
            </select>
          </div>

          {/* Formatting Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Formatting Options
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Indentation
                </label>
                <select
                  value={settings.indent}
                  onChange={(e) => updateSetting("indent", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="  ">2 Spaces</option>
                  <option value="    ">4 Spaces</option>
                  <option value="	">Tab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Lines Between Queries
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.linesBetweenQueries}
                  onChange={(e) =>
                    updateSetting(
                      "linesBetweenQueries",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: "uppercase",
                  label: "Uppercase keywords",
                  description: "SELECT, FROM, WHERE, etc.",
                },
                {
                  key: "denseOperators",
                  label: "Dense operators",
                  description: "Remove spaces around =, +, -, etc.",
                },
                {
                  key: "newlineBeforeOpeningKeyword",
                  label: "Newline before opening keywords",
                  description: "AND, OR on new lines",
                },
              ].map(({ key, label, description }) => (
                <div key={key}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => updateSetting(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={formatSQL}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Format SQL
          </button>
          <button
            onClick={swapInputOutput}
            disabled={!output}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⇄ Swap
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

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Input SQL
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SQL query here..."
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Formatted SQL
              </label>
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {output.length} characters
                </span>
                {output && (
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm font-mono">
              {error}
            </p>
          </div>
        )}

        {/* Query Analysis */}
        {getQueryInfo() && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">
              📊 SQL Analysis
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-green-800 dark:text-green-300">
              <div>
                <strong>Total Queries:</strong> {getQueryInfo().totalQueries}
              </div>
              <div>
                <strong>Total Lines:</strong> {getQueryInfo().totalLines}
              </div>
              <div>
                <strong>Characters:</strong> {getQueryInfo().totalCharacters}
              </div>
              <div>
                <strong>Dialect:</strong> {settings.language.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-7 gap-3 text-sm text-green-800 dark:text-green-300">
              {getQueryInfo().selectQueries > 0 && (
                <div className="text-center p-2 bg-blue-100 dark:bg-blue-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().selectQueries}
                  </div>
                  <div className="text-xs">SELECT</div>
                </div>
              )}
              {getQueryInfo().insertQueries > 0 && (
                <div className="text-center p-2 bg-green-100 dark:bg-green-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().insertQueries}
                  </div>
                  <div className="text-xs">INSERT</div>
                </div>
              )}
              {getQueryInfo().updateQueries > 0 && (
                <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().updateQueries}
                  </div>
                  <div className="text-xs">UPDATE</div>
                </div>
              )}
              {getQueryInfo().deleteQueries > 0 && (
                <div className="text-center p-2 bg-red-100 dark:bg-red-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().deleteQueries}
                  </div>
                  <div className="text-xs">DELETE</div>
                </div>
              )}
              {getQueryInfo().createQueries > 0 && (
                <div className="text-center p-2 bg-purple-100 dark:bg-purple-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().createQueries}
                  </div>
                  <div className="text-xs">CREATE</div>
                </div>
              )}
              {getQueryInfo().alterQueries > 0 && (
                <div className="text-center p-2 bg-indigo-100 dark:bg-indigo-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().alterQueries}
                  </div>
                  <div className="text-xs">ALTER</div>
                </div>
              )}
              {getQueryInfo().dropQueries > 0 && (
                <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="font-semibold">
                    {getQueryInfo().dropQueries}
                  </div>
                  <div className="text-xs">DROP</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            SQL Formatter Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Multi-Database:</strong> MySQL, PostgreSQL, SQLite,
                BigQuery, etc.
              </li>
              <li>
                • <strong>Smart Formatting:</strong> Proper indentation and
                keyword alignment
              </li>
              <li>
                • <strong>Query Analysis:</strong> Count different statement
                types
              </li>
              <li>
                • <strong>Customizable:</strong> Indentation, case, spacing
                options
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Keyword Highlighting:</strong> Visual distinction of
                SQL keywords
              </li>
              <li>
                • <strong>Multiple Queries:</strong> Format multiple statements
                at once
              </li>
              <li>
                • <strong>Copy & Swap:</strong> Easy editing and iteration
                workflow
              </li>
              <li>
                • <strong>Standards Compliant:</strong> Follows SQL formatting
                best practices
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLFormatter;
