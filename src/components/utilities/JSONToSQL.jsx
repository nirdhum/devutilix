"use client";

import { useState, useMemo } from "react";

const SAMPLES = {
  users: JSON.stringify(
    [
      {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 29,
        is_active: true,
        role: "admin",
        created_at: "2026-08-15T09:30:00Z",
      },
      {
        id: 2,
        name: "Bob Smith",
        email: "bob@example.com",
        age: 34,
        is_active: false,
        role: "user",
        created_at: "2026-08-18T14:20:00Z",
      },
      {
        id: 3,
        name: "Charlie Davis",
        email: "charlie@example.com",
        age: 41,
        is_active: true,
        role: "editor",
        created_at: "2026-08-22T18:00:00Z",
      },
    ],
    null,
    2
  ),
  orders: JSON.stringify(
    [
      {
        order_id: "ORD-1001",
        customer_id: 101,
        total_amount: 149.95,
        status: "shipped",
        items_count: 3,
        shipping_address: { city: "San Francisco", state: "CA" },
        paid: true,
      },
      {
        order_id: "ORD-1002",
        customer_id: 102,
        total_amount: 42.5,
        status: "processing",
        items_count: 1,
        shipping_address: { city: "Seattle", state: "WA" },
        paid: true,
      },
    ],
    null,
    2
  ),
};

function inferType(val, dialect) {
  if (val === null || val === undefined) return "TEXT";
  if (typeof val === "boolean") {
    return dialect === "mysql" ? "TINYINT(1)" : "BOOLEAN";
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return val > 2147483647 ? "BIGINT" : "INT";
    }
    return dialect === "sqlite" ? "REAL" : "DECIMAL(10, 2)";
  }
  if (typeof val === "object") {
    if (dialect === "postgres") return "JSONB";
    if (dialect === "mysql") return "JSON";
    return "TEXT";
  }
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      return dialect === "sqlite" ? "TEXT" : "TIMESTAMP";
    }
    return val.length > 255 ? "TEXT" : "VARCHAR(255)";
  }
  return "TEXT";
}

function escapeSQLValue(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return val.toString();
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

export default function JSONToSQL() {
  const [jsonInput, setJsonInput] = useState(SAMPLES.users);
  const [tableName, setTableName] = useState("users");
  const [dialect, setDialect] = useState("postgres"); // postgres | mysql | sqlite | mssql
  const [includeCreate, setIncludeCreate] = useState(true);
  const [copied, setCopied] = useState(false);

  const { sqlOutput, error } = useMemo(() => {
    try {
      const clean = jsonInput.trim();
      if (!clean) return { sqlOutput: "", error: null };

      let parsed = JSON.parse(clean);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
      if (parsed.length === 0) {
        return { sqlOutput: "-- Empty JSON array provided", error: null };
      }

      const cleanTable = tableName.trim() || "my_table";
      const quoteChar = dialect === "mysql" ? "`" : dialect === "mssql" ? `"` : `"`;

      // 1. Gather all unique columns across all records
      const colMap = new Map();
      for (const row of parsed) {
        if (typeof row === "object" && row !== null) {
          for (const key of Object.keys(row)) {
            if (!colMap.has(key)) {
              colMap.set(key, inferType(row[key], dialect));
            }
          }
        }
      }

      const columns = Array.from(colMap.keys());
      if (columns.length === 0) {
        return { sqlOutput: "-- No valid object properties found", error: null };
      }

      let sql = "";

      // CREATE TABLE statement
      if (includeCreate) {
        sql += `CREATE TABLE ${quoteChar}${cleanTable}${quoteChar} (\n`;
        const colDefs = columns.map((col) => {
          const type = colMap.get(col);
          const isPrimary = col.toLowerCase() === "id";
          return `  ${quoteChar}${col}${quoteChar} ${type}${isPrimary ? " PRIMARY KEY" : ""}`;
        });
        sql += colDefs.join(",\n");
        sql += "\n);\n\n";
      }

      // INSERT INTO statement
      const quotedCols = columns.map((c) => `${quoteChar}${c}${quoteChar}`).join(", ");
      sql += `INSERT INTO ${quoteChar}${cleanTable}${quoteChar} (${quotedCols})\nVALUES\n`;

      const valuesRows = parsed.map((row) => {
        const vals = columns.map((c) => escapeSQLValue(row[c]));
        return `  (${vals.join(", ")})`;
      });

      sql += valuesRows.join(",\n") + ";";

      return { sqlOutput: sql, error: null };
    } catch (err) {
      return { sqlOutput: "", error: err.message || "Invalid JSON input" };
    }
  }, [jsonInput, tableName, dialect, includeCreate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName || "data"}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>JSON to SQL Table & Inserts</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Infer column schemas, generate CREATE TABLE definitions, and build batch INSERT statements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sample:</span>
            <button
              onClick={() => {
                setJsonInput(SAMPLES.users);
                setTableName("users");
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Users
            </button>
            <button
              onClick={() => {
                setJsonInput(SAMPLES.orders);
                setTableName("orders");
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Orders
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Table Name:</span>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">SQL Dialect:</span>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="mssql">SQL Server</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCreate}
              onChange={(e) => setIncludeCreate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Include CREATE TABLE</span>
          </label>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              JSON Data Input
            </span>
            <button
              onClick={() => setJsonInput("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste JSON array of objects here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* SQL Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Generated SQL Statements
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                ⬇ Download .sql
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy SQL"}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            rows={18}
            value={sqlOutput}
            placeholder="SQL statements will appear here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-cyan-300 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
