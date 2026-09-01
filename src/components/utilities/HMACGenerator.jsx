"use client";

import { useState, useEffect } from "react";

const SAMPLES = {
  stripe: {
    message: '{"id": "evt_1Mv9tQ2eZvKYlo2C", "object": "event", "type": "payment_intent.succeeded"}',
    secret: "whsec_9b2d8f7e1a3c5b4e8d0a9c8b7a6e5d4c",
    algo: "SHA-256",
  },
  github: {
    message: '{"ref": "refs/heads/main", "before": "000000", "after": "7f8b9a1"}',
    secret: "gh_webhook_secret_key_12345",
    algo: "SHA-256",
  },
};

export default function HMACGenerator() {
  const [message, setMessage] = useState(SAMPLES.stripe.message);
  const [secret, setSecret] = useState(SAMPLES.stripe.secret);
  const [algorithm, setAlgorithm] = useState("SHA-256"); // SHA-256 | SHA-512 | SHA-384 | SHA-1
  const [outputHex, setOutputHex] = useState("");
  const [outputBase64, setOutputBase64] = useState("");
  const [verifySig, setVerifySig] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [error, setError] = useState("");

  // Calculate HMAC using Web Crypto API
  useEffect(() => {
    let isCancelled = false;

    async function computeHMAC() {
      if (!secret) {
        setOutputHex("");
        setOutputBase64("");
        setError("Secret key is required.");
        return;
      }

      try {
        setError("");
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const msgData = encoder.encode(message);

        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: { name: algorithm } },
          false,
          ["sign"]
        );

        const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, msgData);
        if (isCancelled) return;

        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        const base64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        setOutputHex(hex);
        setOutputBase64(base64);
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to calculate HMAC");
        }
      }
    }

    computeHMAC();
    return () => {
      isCancelled = true;
    };
  }, [message, secret, algorithm]);

  const isMatch = verifySig.trim()
    ? verifySig.trim().toLowerCase() === outputHex.toLowerCase() ||
      verifySig.trim() === outputBase64
    : null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const nodeSnippet = `const crypto = require("crypto");
const hmac = crypto.createHmac("${algorithm.toLowerCase().replace("-", "")}", "${secret}");
hmac.update(${JSON.stringify(message)});
const signature = hmac.digest("hex");
console.log(signature);`;

  const pythonSnippet = `import hmac
import hashlib

secret = b"${secret}"
message = b"""${message}"""
sig = hmac.new(secret, message, hashlib.${algorithm.toLowerCase().replace("-", "")}).hexdigest()
print(sig)`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>HMAC Generator & Verifier</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Hardware Accelerated (Web Crypto API)
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate and verify Hash-based Message Authentication Codes (HMAC) client-side for webhook and API signing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sample:</span>
            <button
              onClick={() => {
                setMessage(SAMPLES.stripe.message);
                setSecret(SAMPLES.stripe.secret);
                setAlgorithm(SAMPLES.stripe.algo);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Stripe Webhook
            </button>
            <button
              onClick={() => {
                setMessage(SAMPLES.github.message);
                setSecret(SAMPLES.github.secret);
                setAlgorithm(SAMPLES.github.algo);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors"
            >
              GitHub Webhook
            </button>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Digest Algorithm:
            </span>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
              {["SHA-256", "SHA-512", "SHA-384", "SHA-1"].map((algo) => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-3 py-1.5 transition-colors cursor-pointer ${
                    algorithm === algo
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-gray-400 font-mono">
            {algorithm === "SHA-256" && "256 bits (32 bytes / 64 hex chars)"}
            {algorithm === "SHA-512" && "512 bits (64 bytes / 128 hex chars)"}
            {algorithm === "SHA-384" && "384 bits (48 bytes / 96 hex chars)"}
            {algorithm === "SHA-1" && "160 bits (20 bytes / 40 hex chars)"}
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Payload / Message
            </span>
            <button
              onClick={() => setMessage("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter plaintext message or JSON payload..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Secret Key Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Secret Key
              </span>
              <span className="text-xs text-gray-400 font-mono">{secret.length} chars</span>
            </div>
            <textarea
              rows={3}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret key string..."
              className="w-full p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Verification Box */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Verify Against Signature
              </span>
              {isMatch !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    isMatch
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {isMatch ? "✓ Signatures Match" : "✕ Mismatch"}
                </span>
              )}
            </div>
            <input
              type="text"
              value={verifySig}
              onChange={(e) => setVerifySig(e.target.value)}
              placeholder="Paste signature here to verify match..."
              className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Generated Outputs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Generated HMAC Signatures</h3>

        {error ? (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Hexadecimal Output */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Hexadecimal (Hex)
                </span>
                <button
                  onClick={() => handleCopy(outputHex, "hex")}
                  className="px-2.5 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                >
                  {copiedKey === "hex" ? "✓ Copied" : "Copy Hex"}
                </button>
              </div>
              <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all leading-relaxed font-semibold">
                {outputHex || "..."}
              </p>
            </div>

            {/* Base64 Output */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Base64
                </span>
                <button
                  onClick={() => handleCopy(outputBase64, "base64")}
                  className="px-2.5 py-1 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                >
                  {copiedKey === "base64" ? "✓ Copied" : "Copy Base64"}
                </button>
              </div>
              <p className="font-mono text-xs text-green-600 dark:text-green-400 break-all leading-relaxed font-semibold">
                {outputBase64 || "..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Node.js (crypto)
            </span>
            <button
              onClick={() => handleCopy(nodeSnippet, "node")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {copiedKey === "node" ? "Copied!" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-3 bg-gray-900 text-gray-200 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-36">
            {nodeSnippet}
          </pre>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Python (hmac)
            </span>
            <button
              onClick={() => handleCopy(pythonSnippet, "py")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {copiedKey === "py" ? "Copied!" : "Copy Snippet"}
            </button>
          </div>
          <pre className="p-3 bg-gray-900 text-gray-200 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-36">
            {pythonSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
