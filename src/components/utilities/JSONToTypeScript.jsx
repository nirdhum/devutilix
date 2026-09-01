"use client";

import { useState, useMemo } from "react";

const SAMPLES = {
  user: {
    id: "usr_9481a",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    isActive: true,
    age: 29,
    role: "admin",
    metadata: {
      lastLogin: "2026-09-01T12:00:00Z",
      ipAddress: "192.168.1.1",
      preferences: {
        theme: "dark",
        notifications: true,
        newsletter: false,
      },
    },
    tags: ["developer", "subscriber", "early-adopter"],
    socialLinks: [
      { platform: "github", url: "https://github.com/alexj" },
      { platform: "twitter", url: "https://x.com/alexj" },
    ],
  },
  product: {
    sku: "PRD-8829",
    title: "Wireless Mechanical Keyboard",
    price: 149.99,
    inStock: true,
    dimensions: {
      width: 320,
      height: 40,
      depth: 130,
      unit: "mm",
    },
    ratings: {
      average: 4.8,
      count: 245,
    },
    variants: [
      { id: 1, switchType: "Red (Linear)", keycaps: "PBT White", price: 149.99 },
      { id: 2, switchType: "Brown (Tactile)", keycaps: "PBT Black", price: 154.99 },
    ],
  },
  apiResponse: {
    status: 200,
    success: true,
    message: "Fetched items successfully",
    data: {
      items: [
        { id: 101, title: "Next.js App Router Guide", views: 4200 },
        { id: 102, title: "Tailwind CSS v4 Quickstart", views: 3100 },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 52,
        totalPages: 6,
      },
    },
  },
};

function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") || "NestedType";
}

function generateTypescriptCode(data, rootName = "Root", options = {}) {
  const { exportTypes = true, useType = false, readonlyProps = false, makeOptional = false } = options;
  const interfaces = new Map();

  function inferType(val, keyName) {
    if (val === null || val === undefined) {
      return "unknown";
    }
    if (typeof val === "string") return "string";
    if (typeof val === "number") return "number";
    if (typeof val === "boolean") return "boolean";

    if (Array.isArray(val)) {
      if (val.length === 0) return "unknown[]";
      const elemType = inferType(val[0], keyName + "Item");
      return `${elemType}[]`;
    }

    if (typeof val === "object") {
      const typeName = toPascalCase(keyName);
      processObject(val, typeName);
      return typeName;
    }

    return "any";
  }

  function processObject(obj, typeName) {
    if (interfaces.has(typeName)) return;

    const props = [];
    for (const [key, value] of Object.entries(obj)) {
      const propType = inferType(value, key);
      const isOptional = makeOptional && (value === null || value === undefined);
      const ro = readonlyProps ? "readonly " : "";
      const opt = isOptional ? "?" : "";
      const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      props.push(`  ${ro}${validIdentifier}${opt}: ${propType};`);
    }

    interfaces.set(typeName, props);
  }

  processObject(data, rootName);

  const lines = [];
  for (const [name, props] of interfaces.entries()) {
    const exp = exportTypes ? "export " : "";
    if (useType) {
      lines.push(`${exp}type ${name} = {\n${props.join("\n")}\n};`);
    } else {
      lines.push(`${exp}interface ${name} {\n${props.join("\n")}\n}`);
    }
  }

  return lines.join("\n\n");
}

function generateZodCode(data, rootName = "rootSchema", options = {}) {
  const { exportTypes = true } = options;
  const schemas = new Map();

  function inferZod(val, keyName) {
    if (val === null || val === undefined) {
      return "z.unknown()";
    }
    if (typeof val === "string") return "z.string()";
    if (typeof val === "number") return "z.number()";
    if (typeof val === "boolean") return "z.boolean()";

    if (Array.isArray(val)) {
      if (val.length === 0) return "z.array(z.unknown())";
      const itemZod = inferZod(val[0], keyName + "Item");
      return `z.array(${itemZod})`;
    }

    if (typeof val === "object") {
      const schemaName = keyName.charAt(0).toLowerCase() + keyName.slice(1) + "Schema";
      processZodObject(val, schemaName);
      return schemaName;
    }

    return "z.any()";
  }

  function processZodObject(obj, schemaName) {
    if (schemas.has(schemaName)) return;

    const props = [];
    for (const [key, value] of Object.entries(obj)) {
      const fieldZod = inferZod(value, key);
      const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      props.push(`  ${validKey}: ${fieldZod},`);
    }

    schemas.set(schemaName, props);
  }

  const rootSchemaName = rootName.charAt(0).toLowerCase() + rootName.slice(1) + "Schema";
  processZodObject(data, rootSchemaName);

  const lines = [`import { z } from "zod";\n`];
  for (const [name, props] of schemas.entries()) {
    const exp = exportTypes ? "export " : "";
    const typeName = toPascalCase(name.replace(/Schema$/, ""));
    lines.push(
      `${exp}const ${name} = z.object({\n${props.join("\n")}\n});\n\n${exp}type ${typeName} = z.infer<typeof ${name}>;`
    );
  }

  return lines.join("\n\n");
}

export default function JSONToTypeScript() {
  const [input, setInput] = useState(JSON.stringify(SAMPLES.user, null, 2));
  const [rootName, setRootName] = useState("UserResponse");
  const [outputMode, setOutputMode] = useState("typescript"); // "typescript" | "zod"
  const [useType, setUseType] = useState(false);
  const [exportTypes, setExportTypes] = useState(true);
  const [readonlyProps, setReadonlyProps] = useState(false);
  const [makeOptional, setMakeOptional] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: "" };
    }
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed !== "object" || parsed === null) {
        return { output: "", error: "Input must be a valid JSON object or array." };
      }

      if (outputMode === "zod") {
        const code = generateZodCode(parsed, rootName || "Root", { exportTypes });
        return { output: code, error: "" };
      } else {
        const code = generateTypescriptCode(parsed, rootName || "Root", {
          exportTypes,
          useType,
          readonlyProps,
          makeOptional,
        });
        return { output: code, error: "" };
      }
    } catch (err) {
      return { output: "", error: `JSON Parse Error: ${err.message}` };
    }
  }, [input, rootName, outputMode, useType, exportTypes, readonlyProps, makeOptional]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>TypeScript & Zod Schema Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Convert raw JSON into strictly-typed TypeScript interfaces, type aliases, or Zod validation schemas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Load sample:</span>
            <button
              onClick={() => {
                setInput(JSON.stringify(SAMPLES.user, null, 2));
                setRootName("UserProfile");
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              User
            </button>
            <button
              onClick={() => {
                setInput(JSON.stringify(SAMPLES.product, null, 2));
                setRootName("Product");
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => {
                setInput(JSON.stringify(SAMPLES.apiResponse, null, 2));
                setRootName("ApiResponse");
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              API Response
            </button>
          </div>
        </div>

        {/* Options Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Root Type Name
            </label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="RootType"
              className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Target Output
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => setOutputMode("typescript")}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                  outputMode === "typescript"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                TypeScript
              </button>
              <button
                type="button"
                onClick={() => setOutputMode("zod")}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                  outputMode === "zod"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Zod Schema
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-4 sm:pt-6">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={exportTypes}
                onChange={(e) => setExportTypes(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span>Export declarations</span>
            </label>

            {outputMode === "typescript" && (
              <>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={useType}
                    onChange={(e) => setUseType(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span>Use &apos;type&apos; alias</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={readonlyProps}
                    onChange={(e) => setReadonlyProps(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span>Readonly props</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={makeOptional}
                    onChange={(e) => setMakeOptional(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span>Optional on null</span>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              JSON Input
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBeautify}
                className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Format JSON"
              >
                Prettify
              </button>
              <button
                onClick={() => setInput("")}
                className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw JSON here..."
            className="w-full flex-1 min-h-[420px] font-mono text-xs p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />

          {error && (
            <div className="mt-3 p-3 text-xs bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Generated {outputMode === "typescript" ? "TypeScript Definitions" : "Zod Schemas"}
            </span>

            <button
              onClick={handleCopy}
              disabled={!output}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer
                ${
                  copied
                    ? "bg-green-600 text-white"
                    : output
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="w-full flex-1 min-h-[420px] font-mono text-xs p-3 bg-gray-900 text-gray-100 border border-gray-800 rounded-lg overflow-auto leading-relaxed">
            {output || "// Output will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
