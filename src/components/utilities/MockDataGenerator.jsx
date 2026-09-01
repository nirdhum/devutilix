"use client";

import { useState, useMemo } from "react";

const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const DOMAINS = ["example.com", "techcorp.io", "cloudscale.dev", "nexus.org", "alpha.co"];
const CITIES = ["New York", "San Francisco", "Austin", "London", "Berlin", "Tokyo", "Sydney", "Toronto", "Paris", "Amsterdam"];
const COUNTRIES = ["United States", "United Kingdom", "Germany", "Japan", "Australia", "Canada", "France", "Netherlands"];
const COMPANIES = ["Apex Global", "Starlight Systems", "Nexus Technologies", "Quantum Dynamics", "Vanguard Solutions", "Hyperion Media", "CyberPulse Inc."];
const ROLES = ["Software Engineer", "Product Manager", "UI/UX Designer", "DevOps Specialist", "Data Scientist", "Solutions Architect", "Marketing Director"];
const STATUSES = ["active", "pending", "suspended", "verified"];

const DEFAULT_FIELDS = [
  { key: "id", type: "id" },
  { key: "name", type: "fullName" },
  { key: "email", type: "email" },
  { key: "company", type: "company" },
  { key: "role", type: "role" },
  { key: "city", type: "city" },
  { key: "status", type: "status" },
  { key: "created_at", type: "date" },
];

function generateFieldValue(type, index) {
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (type) {
    case "id":
      return index + 1;
    case "uuid":
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    case "firstName":
      return rand(FIRST_NAMES);
    case "lastName":
      return rand(LAST_NAMES);
    case "fullName":
      return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
    case "email": {
      const f = rand(FIRST_NAMES).toLowerCase();
      const l = rand(LAST_NAMES).toLowerCase();
      return `${f}.${l}@${rand(DOMAINS)}`;
    }
    case "phone":
      return `+1-${randInt(200, 999)}-555-${randInt(1000, 9999)}`;
    case "company":
      return rand(COMPANIES);
    case "role":
      return rand(ROLES);
    case "city":
      return rand(CITIES);
    case "country":
      return rand(COUNTRIES);
    case "status":
      return rand(STATUSES);
    case "price":
      return parseFloat((Math.random() * 500 + 10).toFixed(2));
    case "boolean":
      return Math.random() > 0.5;
    case "date": {
      const d = new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000));
      return d.toISOString();
    }
    default:
      return "text";
  }
}

export default function MockDataGenerator() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [rowCount, setRowCount] = useState(10);
  const [format, setFormat] = useState("json"); // json | ndjson | csv
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);

  const addField = () => {
    setFields([...fields, { key: `field_${fields.length + 1}`, type: "fullName" }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, keyOrType, val) => {
    const updated = [...fields];
    updated[index][keyOrType] = val;
    setFields(updated);
  };

  const outputData = useMemo(() => {
    // Generate records
    const records = [];
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      for (const f of fields) {
        row[f.key] = generateFieldValue(f.type, i);
      }
      records.push(row);
    }

    if (format === "json") {
      return JSON.stringify(records, null, 2);
    } else if (format === "ndjson") {
      return records.map((r) => JSON.stringify(r)).join("\n");
    } else if (format === "csv") {
      const headers = fields.map((f) => f.key);
      const csvLines = [headers.join(",")];
      for (const r of records) {
        csvLines.push(
          headers
            .map((h) => {
              const val = r[h];
              if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            })
            .join(",")
        );
      }
      return csvLines.join("\n");
    }
    return "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, rowCount, format, seed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mime = format === "csv" ? "text/csv" : "application/json";
    const ext = format === "csv" ? "csv" : format === "ndjson" ? "ndjson" : "json";
    const blob = new Blob([outputData], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_data.${ext}`;
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
              <span>Mock Data (Faker) Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate realistic synthetic datasets for testing with names, emails, addresses, companies, and timestamps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Regenerate</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
            >
              {copied ? "✓ Copied!" : "Copy Data"}
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Rows ({rowCount}):</span>
            <input
              type="range"
              min={1}
              max={100}
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-36 cursor-pointer"
            />
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs">
            {["json", "ndjson", "csv"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer ${
                  format === fmt
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schema Builder (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Schema Fields ({fields.length})
            </span>
            <button
              onClick={addField}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              + Add Field
            </button>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-auto pr-1">
            {fields.map((f, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs"
              >
                <input
                  type="text"
                  value={f.key}
                  onChange={(e) => updateField(idx, "key", e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-mono text-gray-900 dark:text-white"
                />
                <select
                  value={f.type}
                  onChange={(e) => updateField(idx, "type", e.target.value)}
                  className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="id">ID (1, 2, 3)</option>
                  <option value="uuid">UUID v4</option>
                  <option value="fullName">Full Name</option>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                  <option value="email">Email Address</option>
                  <option value="phone">Phone Number</option>
                  <option value="company">Company</option>
                  <option value="role">Job Title</option>
                  <option value="city">City</option>
                  <option value="country">Country</option>
                  <option value="status">Status</option>
                  <option value="price">Price / Float</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">ISO Timestamp</option>
                </select>
                <button
                  onClick={() => removeField(idx)}
                  className="text-gray-400 hover:text-red-500 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Output View (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Generated Mock Records
            </span>
            <span className="text-xs text-gray-400 font-mono">{rowCount} rows</span>
          </div>
          <textarea
            readOnly
            rows={19}
            value={outputData}
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
