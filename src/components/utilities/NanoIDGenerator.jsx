"use client";

import { useState, useMemo, useEffect } from "react";

const ALPHABETS = {
  standard: "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzict",
  alphanumeric: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  lowercase: "0123456789abcdefghijklmnopqrstuvwxyz",
  hex: "0123456789abcdef",
  numbers: "0123456789",
};

function generateNanoId(size, alphabet) {
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);
  let id = "";

  while (true) {
    const bytes = new Uint8Array(step);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < step; i++) bytes[i] = Math.floor(Math.random() * 256);
    }

    for (let i = 0; i < step; i++) {
      const byte = bytes[i] & mask;
      if (alphabet[byte]) {
        id += alphabet[byte];
        if (id.length === size) return id;
      }
    }
  }
}

export default function NanoIDGenerator() {
  const [alphabetKey, setAlphabetKey] = useState("standard");
  const [customAlphabet, setCustomAlphabet] = useState("");
  const [length, setLength] = useState(21);
  const [quantity, setQuantity] = useState(10);
  const [prefix, setPrefix] = useState("");
  const [generatedIds, setGeneratedIds] = useState([]);
  const [copiedKey, setCopiedKey] = useState("");

  const activeAlphabet = alphabetKey === "custom" ? customAlphabet || ALPHABETS.standard : ALPHABETS[alphabetKey];

  const generate = () => {
    const list = [];
    for (let i = 0; i < quantity; i++) {
      const raw = generateNanoId(length, activeAlphabet);
      list.push(prefix ? `${prefix}${raw}` : raw);
    }
    setGeneratedIds(list);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alphabetKey, customAlphabet, length, quantity, prefix]);

  const collisionEstimate = useMemo(() => {
    const alphabetSize = activeAlphabet.length;
    // Combinations = alphabetSize ^ length
    const log10Combinations = length * Math.log10(alphabetSize);
    return `~10^${Math.round(log10Combinations)} unique combinations`;
  }, [activeAlphabet, length]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedIds.join("\n"));
    setCopiedKey("all");
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleCopyOne = (id, idx) => {
    navigator.clipboard.writeText(id);
    setCopiedKey(String(idx));
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>NanoID & CUID Unique Key Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Hardware CSPRNG
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate collision-resistant, URL-friendly unique IDs using cryptographically secure Web Crypto random values.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              🔄 Refresh IDs
            </button>
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
            >
              {copiedKey === "all" ? "✓ All Copied!" : "Copy All IDs"}
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Length: {length}</span>
              <span className="text-gray-400 font-mono text-[10px]">{collisionEstimate}</span>
            </div>
            <input
              type="range"
              min={6}
              max={48}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Batch Quantity: {quantity}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <span className="text-gray-500 block">Prefix (Optional)</span>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. user_ or c_"
              className="w-full px-2.5 py-1 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Alphabet Selector */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 font-semibold mr-1">Alphabet:</span>
          {[
            { id: "standard", label: "Standard (A-Za-z0-9_-)" },
            { id: "alphanumeric", label: "Alphanumeric" },
            { id: "lowercase", label: "Lowercase Only" },
            { id: "hex", label: "Hexadecimal" },
            { id: "numbers", label: "Numeric PIN" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAlphabetKey(item.id)}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                alphabetKey === item.id
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated IDs Output */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Generated Secure Identifiers ({generatedIds.length})
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Hardware Crypto PRNG</span>
          </span>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
          {generatedIds.map((id, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 text-xs font-mono group"
            >
              <span className="text-gray-400 font-semibold text-[10px] w-6">#{idx + 1}</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold flex-1 break-all select-all">
                {id}
              </span>
              <button
                onClick={() => handleCopyOne(id, idx)}
                className="px-2.5 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-[11px] cursor-pointer"
              >
                {copiedKey === String(idx) ? "✓ Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
