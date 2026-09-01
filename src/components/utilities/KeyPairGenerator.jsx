"use client";

import { useState } from "react";

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatPEM(base64, label) {
  const chunks = base64.match(/.{1,64}/g) || [base64];
  return `-----BEGIN ${label}-----\n${chunks.join("\n")}\n-----END ${label}-----`;
}

export default function KeyPairGenerator() {
  const [keyType, setKeyType] = useState("RSA"); // RSA | ECDSA
  const [modulusLength, setModulusLength] = useState("2048"); // 2048 | 3072 | 4096
  const [namedCurve, setNamedCurve] = useState("P-256"); // P-256 | P-384 | P-521
  const [publicKeyPEM, setPublicKeyPEM] = useState("");
  const [privateKeyPEM, setPrivateKeyPEM] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setPublicKeyPEM("");
    setPrivateKeyPEM("");
    setFingerprint("");

    try {
      let keyPair;
      if (keyType === "RSA") {
        keyPair = await window.crypto.subtle.generateKey(
          {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: parseInt(modulusLength, 10),
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
          },
          true,
          ["sign", "verify"]
        );
      } else {
        keyPair = await window.crypto.subtle.generateKey(
          {
            name: "ECDSA",
            namedCurve,
          },
          true,
          ["sign", "verify"]
        );
      }

      // Export Private Key (PKCS#8)
      const privBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      const privB64 = arrayBufferToBase64(privBuffer);
      const privPEM = formatPEM(privB64, "PRIVATE KEY");
      setPrivateKeyPEM(privPEM);

      // Export Public Key (SPKI)
      const pubBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const pubB64 = arrayBufferToBase64(pubBuffer);
      const pubPEM = formatPEM(pubB64, "PUBLIC KEY");
      setPublicKeyPEM(pubPEM);

      // Calculate SHA-256 Fingerprint of Public Key
      const fpBuffer = await window.crypto.subtle.digest("SHA-256", pubBuffer);
      const fpArray = Array.from(new Uint8Array(fpBuffer));
      const fpColons = fpArray.map((b) => b.toString(16).padStart(2, "0")).join(":");
      setFingerprint(`SHA256:${fpColons}`);
    } catch (err) {
      setError(err.message || "Failed to generate key pair");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>RSA & ECDSA Key Pair Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                100% Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate PKCS#8 Private Keys and SPKI Public Keys in the browser. Zero network transmission.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Generate New Key Pair</span>
              </span>
            )}
          </button>
        </div>

        {/* Algorithm Settings */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Cryptographic Family
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setKeyType("RSA")}
                className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                  keyType === "RSA"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                }`}
              >
                RSA (Standard)
              </button>
              <button
                onClick={() => setKeyType("ECDSA")}
                className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                  keyType === "ECDSA"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                }`}
              >
                ECDSA (Elliptic Curve)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              {keyType === "RSA" ? "Modulus Key Size" : "Elliptic Curve"}
            </label>
            {keyType === "RSA" ? (
              <select
                value={modulusLength}
                onChange={(e) => setModulusLength(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="2048">2048 bits (Standard Production)</option>
                <option value="3072">3072 bits (High Security)</option>
                <option value="4096">4096 bits (Maximum Security - slower)</option>
              </select>
            ) : (
              <select
                value={namedCurve}
                onChange={(e) => setNamedCurve(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="P-256">NIST P-256 (secp256r1) - Recommended</option>
                <option value="P-384">NIST P-384 (secp384r1)</option>
                <option value="P-521">NIST P-521 (secp521r1)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Keys Output */}
      {publicKeyPEM ? (
        <div className="space-y-6">
          {/* Fingerprint Bar */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              Public Key SHA-256 Fingerprint:
            </span>
            <span className="font-mono text-gray-500 dark:text-gray-400 break-all">
              {fingerprint}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Public Key Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  <span>Public Key (SPKI)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(publicKeyPEM, "pub")}
                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                  >
                    {copiedKey === "pub" ? "✓ Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDownload(publicKeyPEM, "public_key.pem")}
                    className="px-2 py-1 text-xs rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    Download .pem
                  </button>
                </div>
              </div>
              <pre className="w-full flex-1 p-3 bg-gray-900 text-gray-200 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-80 select-all">
                {publicKeyPEM}
              </pre>
            </div>

            {/* Private Key Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Private Key (PKCS#8)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(privateKeyPEM, "priv")}
                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                  >
                    {copiedKey === "priv" ? "✓ Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDownload(privateKeyPEM, "private_key.pem")}
                    className="px-2 py-1 text-xs rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    Download .pem
                  </button>
                </div>
              </div>
              <pre className="w-full flex-1 p-3 bg-gray-900 text-amber-300 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-80 select-all">
                {privateKeyPEM}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            No Key Pair Generated Yet
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Select your desired cryptographic algorithm above and click &quot;Generate New Key Pair&quot; to create a new key pair client-side.
          </p>
        </div>
      )}
    </div>
  );
}
