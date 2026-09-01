"use client";

import { useState, useMemo } from "react";

const SAMPLES = {
  get: `curl 'https://api.example.com/v1/users?role=developer&limit=10' \\
  -H 'Accept: application/json' \\
  -H 'Authorization: Bearer my-secret-api-token'`,

  postJson: `curl 'https://api.example.com/v1/orders' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token_xyz123' \\
  --data-raw '{"productId": "PRD-900", "quantity": 2, "shippingAddress": "123 Dev Lane"}'`,

  auth: `curl 'https://api.example.com/v1/billing' \\
  -u 'admin_user:super_secret_password' \\
  -H 'Accept: application/json'`,
};

function parseCurl(curlString) {
  if (!curlString || !curlString.trim().startsWith("curl")) {
    return { error: "Please enter a valid curl command starting with 'curl'." };
  }

  // Remove line continuations (\ at end of line)
  const cleanCmd = curlString.replace(/\\\r?\n/g, " ").trim();

  // Simple token parser that respects single and double quotes
  const tokens = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escapeNext = false;

  for (let i = 0; i < cleanCmd.length; i++) {
    const ch = cleanCmd[i];

    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (ch === "\\") {
      escapeNext = true;
      continue;
    }

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if ((ch === " " || ch === "\t") && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  let url = "";
  let method = "";
  const headers = {};
  let data = "";
  let basicAuth = "";

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];

    if (t === "-X" || t === "--request") {
      method = tokens[++i];
    } else if (t === "-H" || t === "--header") {
      const headerStr = tokens[++i];
      if (headerStr && headerStr.includes(":")) {
        const colonIdx = headerStr.indexOf(":");
        const k = headerStr.slice(0, colonIdx).trim();
        const v = headerStr.slice(colonIdx + 1).trim();
        headers[k] = v;
      }
    } else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary" || t === "--json") {
      data = tokens[++i] || "";
    } else if (t === "-u" || t === "--user") {
      basicAuth = tokens[++i] || "";
    } else if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("'http") || t.startsWith('"http')) {
      url = t.replace(/^['"]|['"]$/g, "");
    } else if (!t.startsWith("-") && !url) {
      url = t;
    }
  }

  if (!method) {
    method = data ? "POST" : "GET";
  }

  if (basicAuth && !headers["Authorization"]) {
    headers["Authorization"] = `Basic ${btoa(basicAuth)}`;
  }

  return {
    url: url || "https://api.example.com",
    method: method.toUpperCase(),
    headers,
    data,
  };
}

function generateFetchCode({ url, method, headers, data }) {
  const options = {
    method,
  };

  if (Object.keys(headers).length > 0) {
    options.headers = headers;
  }

  let bodyCode = "";
  if (data) {
    try {
      JSON.parse(data);
      bodyCode = `  body: JSON.stringify(${JSON.stringify(JSON.parse(data), null, 2).replace(/\n/g, "\n  ")}),\n`;
    } catch {
      bodyCode = `  body: ${JSON.stringify(data)},\n`;
    }
  }

  const headersCode = Object.keys(headers).length > 0
    ? `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},\n`
    : "";

  return `// Native JavaScript (Fetch API)
const response = await fetch(${JSON.stringify(url)}, {
  method: "${method}",
${headersCode}${bodyCode}});

const result = await response.json();
console.log(result);`;
}

function generateAxiosCode({ url, method, headers, data }) {
  let dataCode = "";
  if (data) {
    try {
      JSON.parse(data);
      dataCode = `  data: ${JSON.stringify(JSON.parse(data), null, 2).replace(/\n/g, "\n  ")},\n`;
    } catch {
      dataCode = `  data: ${JSON.stringify(data)},\n`;
    }
  }

  const headersCode = Object.keys(headers).length > 0
    ? `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},\n`
    : "";

  return `// JavaScript (Axios)
import axios from "axios";

const response = await axios({
  method: "${method.toLowerCase()}",
  url: ${JSON.stringify(url)},
${headersCode}${dataCode}});

console.log(response.data);`;
}

function generatePythonCode({ url, method, headers, data }) {
  let payloadPy = "";
  if (data) {
    try {
      JSON.parse(data);
      payloadPy = `payload = ${data}\n`;
    } catch {
      payloadPy = `payload = """${data}"""\n`;
    }
  }

  let headersPy = "";
  if (Object.keys(headers).length > 0) {
    headersPy = `headers = ${JSON.stringify(headers, null, 2)}\n`;
  }

  let callArgs = [`url`];
  if (headersPy) callArgs.push("headers=headers");
  if (payloadPy) {
    try {
      JSON.parse(data);
      callArgs.push("json=payload");
    } catch {
      callArgs.push("data=payload");
    }
  }

  return `# Python (requests)
import requests

url = "${url}"
${headersPy}${payloadPy}
response = requests.request("${method}", ${callArgs.join(", ")})
print(response.json())`;
}

function generateGoCode({ url, method, headers, data }) {
  const bodyGo = data ? `strings.NewReader(${JSON.stringify(data)})` : "nil";
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`)
    .join("\n");

  return `// Go (net/http)
package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t"strings"
)

func main() {
\turl := "${url}"
\treq, err := http.NewRequest("${method}", url, ${bodyGo})
\tif err != nil {
\t\tpanic(err)
\t}

${headerLines}

\tres, err := http.DefaultClient.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbody, _ := io.ReadAll(res.Body)
\tfmt.Println(string(body))
}`;
}

export default function CurlConverter() {
  const [curl, setCurl] = useState(SAMPLES.postJson);
  const [targetLang, setTargetLang] = useState("fetch"); // fetch | axios | python | go
  const [copied, setCopied] = useState(false);

  const { parsed, code, error } = useMemo(() => {
    if (!curl.trim()) {
      return { parsed: null, code: "", error: "" };
    }

    const p = parseCurl(curl);
    if (p.error) {
      return { parsed: null, code: "", error: p.error };
    }

    let generated = "";
    switch (targetLang) {
      case "axios":
        generated = generateAxiosCode(p);
        break;
      case "python":
        generated = generatePythonCode(p);
        break;
      case "go":
        generated = generateGoCode(p);
        break;
      case "fetch":
      default:
        generated = generateFetchCode(p);
        break;
    }

    return { parsed: p, code: generated, error: "" };
  }, [curl, targetLang]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>cURL to Code Converter</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Convert raw cURL terminal commands into ready-to-run code in JavaScript (Fetch & Axios), Python, or Go.
            </p>
          </div>

          {/* Sample buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Load sample:</span>
            <button
              onClick={() => setCurl(SAMPLES.get)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              GET Bearer
            </button>
            <button
              onClick={() => setCurl(SAMPLES.postJson)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              POST JSON
            </button>
            <button
              onClick={() => setCurl(SAMPLES.auth)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Basic Auth
            </button>
          </div>
        </div>

        {/* Target language selector */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            {[
              { id: "fetch", label: "JavaScript (Fetch)" },
              { id: "axios", label: "JavaScript (Axios)" },
              { id: "python", label: "Python (Requests)" },
              { id: "go", label: "Go (net/http)" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setTargetLang(lang.id)}
                className={`px-3 py-1.5 transition-colors ${
                  targetLang === lang.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {parsed && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                {parsed.method}
              </span>
              <span className="font-mono text-gray-600 dark:text-gray-400 truncate max-w-xs">
                {parsed.url}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* cURL Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">cURL Command</span>
            <button
              onClick={() => setCurl("")}
              className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            >
              Clear
            </button>
          </div>

          <textarea
            value={curl}
            onChange={(e) => setCurl(e.target.value)}
            placeholder="Paste curl command here..."
            className="w-full flex-1 min-h-[380px] font-mono text-xs p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />

          {error && (
            <div className="mt-3 p-3 text-xs bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Generated Code Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Generated Code
            </span>

            <button
              onClick={handleCopy}
              disabled={!code}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer
                ${
                  copied
                    ? "bg-green-600 text-white"
                    : code
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

          <pre className="w-full flex-1 min-h-[380px] font-mono text-xs p-3 bg-gray-900 text-gray-100 border border-gray-800 rounded-lg overflow-auto leading-relaxed">
            {code || "// Code will generate here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
