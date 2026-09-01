"use client";

import { useState, useMemo } from "react";

export default function BasicAuthGenerator() {
  const [mode, setMode] = useState("encode"); // encode | decode

  // Encode inputs
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("secret12345");
  const [sampleUrl, setSampleUrl] = useState("https://api.example.com/v1/users");

  // Decode inputs
  const [decodeInput, setDecodeInput] = useState("Basic YWRtaW46c2VjcmV0MTIzNDU=");
  const [copiedKey, setCopiedKey] = useState("");

  // Encoding outputs
  const encoded = useMemo(() => {
    const raw = `${username}:${password}`;
    try {
      const base64 = btoa(unescape(encodeURIComponent(raw)));
      const header = `Authorization: Basic ${base64}`;
      let urlWithAuth = sampleUrl;
      try {
        const u = new URL(sampleUrl);
        u.username = encodeURIComponent(username);
        u.password = encodeURIComponent(password);
        urlWithAuth = u.toString();
      } catch {
        urlWithAuth = `https://${encodeURIComponent(username)}:${encodeURIComponent(password)}@example.com`;
      }
      return { base64, header, urlWithAuth, curl: `curl -H "${header}" "${sampleUrl}"` };
    } catch {
      return { base64: "", header: "", urlWithAuth: "", curl: "" };
    }
  }, [username, password, sampleUrl]);

  // Decoding outputs
  const decoded = useMemo(() => {
    let clean = decodeInput.trim();
    if (clean.toLowerCase().startsWith("authorization:")) {
      clean = clean.replace(/^authorization:\s*/i, "");
    }
    if (clean.toLowerCase().startsWith("basic ")) {
      clean = clean.replace(/^basic\s+/i, "");
    }

    try {
      const raw = decodeURIComponent(escape(atob(clean)));
      const colonIndex = raw.indexOf(":");
      if (colonIndex === -1) {
        return { username: raw, password: "", error: "Missing password delimiter (:)" };
      }
      return {
        username: raw.slice(0, colonIndex),
        password: raw.slice(colonIndex + 1),
        error: null,
      };
    } catch {
      return { username: "", password: "", error: "Invalid Base64 string" };
    }
  }, [decodeInput]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Basic Auth Header Generator & Decoder</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                RFC 7617
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate HTTP Basic Authorization headers or decode credentials from incoming tokens.
            </p>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                mode === "encode"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              Encode (Credentials ➔ Header)
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                mode === "decode"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              Decode (Header ➔ Credentials)
            </button>
          </div>
        </div>
      </div>

      {mode === "encode" ? (
        /* Encode View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
              Credentials
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Username / API Key ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Password / Secret Key
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Target Endpoint URL (Optional)
              </label>
              <input
                type="text"
                value={sampleUrl}
                onChange={(e) => setSampleUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Outputs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
              {/* Header Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    HTTP Request Header
                  </span>
                  <button
                    onClick={() => handleCopy(encoded.header, "hdr")}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    {copiedKey === "hdr" ? "✓ Copied" : "Copy Header"}
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded-lg overflow-auto break-all">
                  {encoded.header}
                </pre>
              </div>

              {/* Base64 Token */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Raw Base64 Token
                  </span>
                  <button
                    onClick={() => handleCopy(encoded.base64, "b64")}
                    className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {copiedKey === "b64" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-800 dark:text-gray-200 rounded-lg overflow-auto break-all">
                  {encoded.base64}
                </pre>
              </div>

              {/* Embedded URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    URL With Embedded Credentials
                  </span>
                  <button
                    onClick={() => handleCopy(encoded.urlWithAuth, "url")}
                    className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {copiedKey === "url" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-800 dark:text-gray-200 rounded-lg overflow-auto break-all">
                  {encoded.urlWithAuth}
                </pre>
              </div>

              {/* cURL Command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    cURL Command
                  </span>
                  <button
                    onClick={() => handleCopy(encoded.curl, "curl")}
                    className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {copiedKey === "curl" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-2.5 bg-gray-900 text-blue-400 font-mono text-xs rounded-lg overflow-auto break-all">
                  {encoded.curl}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Decode View */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Paste Authorization Header or Base64 String
            </label>
            <input
              type="text"
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="Basic YWRtaW46c2VjcmV0MTIzNDU= or YWRtaW46c2VjcmV0MTIzNDU="
              className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {decoded.error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {decoded.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Extracted Username
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-gray-900 dark:text-white">
                    {decoded.username || "<empty>"}
                  </span>
                  <button
                    onClick={() => handleCopy(decoded.username, "dec_user")}
                    className="px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {copiedKey === "dec_user" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Extracted Password
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {decoded.password || "<empty>"}
                  </span>
                  <button
                    onClick={() => handleCopy(decoded.password, "dec_pass")}
                    className="px-2 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {copiedKey === "dec_pass" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
