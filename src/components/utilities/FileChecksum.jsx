"use client";

import { useState, useRef } from "react";
import { md5, sha1, sha256, sha512 } from "hash-wasm";

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function FileChecksum() {
  const [fileInfo, setFileInfo] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [isHashing, setIsHashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expectedHash, setExpectedHash] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    setFileInfo({
      name: file.name,
      size: file.size,
      sizeFormatted: formatBytes(file.size),
      type: file.type || "application/octet-stream",
      lastModified: new Date(file.lastModified).toLocaleString(),
    });

    setHashes(null);
    setIsHashing(true);
    setProgress(10);

    try {
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      setProgress(40);

      // Compute all 4 hashes in parallel using hash-wasm
      const [md5Hash, sha1Hash, sha256Hash, sha512Hash] = await Promise.all([
        md5(uint8),
        sha1(uint8),
        sha256(uint8),
        sha512(uint8),
      ]);

      setProgress(100);
      setHashes({
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,
        sha512: sha512Hash,
      });
    } catch (err) {
      console.error("Hashing failed:", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // Check if expected hash matches any calculated hash
  const matchResult = (() => {
    if (!hashes || !expectedHash.trim()) return null;
    const clean = expectedHash.trim().toLowerCase();
    if (clean === hashes.md5.toLowerCase()) return { match: true, algo: "MD5" };
    if (clean === hashes.sha1.toLowerCase()) return { match: true, algo: "SHA-1" };
    if (clean === hashes.sha256.toLowerCase()) return { match: true, algo: "SHA-256" };
    if (clean === hashes.sha512.toLowerCase()) return { match: true, algo: "SHA-512" };
    return { match: false };
  })();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>File Checksum & Integrity Verifier</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                100% Local (WebAssembly)
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Calculate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes of local files with zero server uploads.
            </p>
          </div>
        </div>
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Drag and drop any file here, or click to browse
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports ISOs, ZIPs, images, binaries, documents. Files are processed entirely in browser memory.
          </p>
        </div>
      </div>

      {/* Loading Progress */}
      {isHashing && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2 text-center">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold">
            <span>Computing cryptographic checksums with WebAssembly...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* File Metadata & Checksums */}
      {fileInfo && hashes && (
        <div className="space-y-6">
          {/* File Info Bar */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">File Name</span>
              <span className="font-bold text-gray-900 dark:text-white truncate block">{fileInfo.name}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">Size</span>
              <span className="font-bold text-gray-900 dark:text-white">{fileInfo.sizeFormatted} ({fileInfo.size.toLocaleString()} bytes)</span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">MIME Type</span>
              <span className="font-bold text-gray-900 dark:text-white">{fileInfo.type}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">Last Modified</span>
              <span className="font-bold text-gray-900 dark:text-white">{fileInfo.lastModified}</span>
            </div>
          </div>

          {/* Verification Box */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Compare with Expected Hash (e.g. from GitHub Release or ISO publisher)
              </span>
              {matchResult && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    matchResult.match
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {matchResult.match ? `✓ Match Confirmed (${matchResult.algo})` : "✕ Hash Mismatch"}
                </span>
              )}
            </div>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste expected MD5, SHA-1, SHA-256, or SHA-512 hash here..."
              className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Checksum Cards */}
          <div className="space-y-3">
            {[
              { label: "SHA-256", key: "sha256", value: hashes.sha256, badge: "Recommended" },
              { label: "SHA-512", key: "sha512", value: hashes.sha512, badge: "Maximum Security" },
              { label: "SHA-1", key: "sha1", value: hashes.sha1, badge: "Legacy" },
              { label: "MD5", key: "md5", value: hashes.md5, badge: "Fast" },
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold">
                      {item.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, item.key)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer"
                  >
                    {copiedKey === item.key ? "✓ Copied" : "Copy Hash"}
                  </button>
                </div>
                <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all leading-relaxed select-all">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
