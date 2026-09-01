"use client";

import { useState, useMemo } from "react";

const MORSE_MAP = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----",
  " ": "/",
};

const UPSIDE_DOWN_MAP = {
  a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183",
  h: "\u0265", i: "\u0131", j: "\u027E", k: "\u029E", l: "l", m: "\u026F",
  n: "u", o: "o", p: "d", q: "b", r: "\u0279", s: "s", t: "\u0287", u: "n",
  v: "\u028C", w: "\u028D", x: "x", y: "\u028E", z: "z",
  A: "\u2200", B: "\u0412", C: "\u0186", D: "\u15E1", E: "\u018E", F: "\u2132",
  G: "\u2141", H: "H", I: "I", J: "\u017F", K: "\u029E", L: "\u02E5", M: "W",
  N: "N", O: "O", P: "\u0500", Q: "\u038C", R: "\u1D1A", S: "S", T: "\u22A5",
  U: "\u2229", V: "\u039B", W: "M", X: "X", Y: "\u2144", Z: "Z",
  0: "0", 1: "\u0196", 2: "\u1105", 3: "\u0190", 4: "\u3123", 5: "\u03DA",
  6: "9", 7: "\u3125", 8: "8", 9: "6",
  ".": "\u02D9", ",": "'", "'": ",", "\"": "„", "!": "\u00A1", "?": "\u00BF",
  "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{",
};

export default function StringObfuscator() {
  const [inputText, setInputText] = useState("Hello World! DevutiliX Developer Tools.");
  const [mode, setMode] = useState("rot13"); // rot13 | binary | hex | morse | leet | upsidedown
  const [caesarShift, setCaesarShift] = useState(13);
  const [copied, setCopied] = useState(false);

  const outputText = useMemo(() => {
    if (!inputText) return "";

    switch (mode) {
      case "rot13": {
        const shift = caesarShift % 26;
        return inputText.replace(/[a-zA-Z]/g, (char) => {
          const code = char.charCodeAt(0);
          const isUpper = code >= 65 && code <= 90;
          const base = isUpper ? 65 : 97;
          return String.fromCharCode(((code - base + shift) % 26) + base);
        });
      }

      case "binary":
        return inputText
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ");

      case "hex":
        return inputText
          .split("")
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(" ");

      case "morse":
        return inputText
          .toUpperCase()
          .split("")
          .map((c) => MORSE_MAP[c] || c)
          .join(" ");

      case "leet":
        return inputText
          .replace(/[aA]/g, "4")
          .replace(/[eE]/g, "3")
          .replace(/[iI]/g, "1")
          .replace(/[oO]/g, "0")
          .replace(/[sS]/g, "5")
          .replace(/[tT]/g, "7");

      case "upsidedown":
        return inputText
          .split("")
          .map((c) => UPSIDE_DOWN_MAP[c] || c)
          .reverse()
          .join("");

      default:
        return inputText;
    }
  }, [inputText, mode, caesarShift]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
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
              <span>String Obfuscator & Cipher</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Multi-Mode
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Transform text using ROT13, Caesar cipher, 8-bit binary, hexadecimal strings, Morse code, and leetspeak.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
          >
            {copied ? "✓ Copied!" : "Copy Output"}
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2 text-xs font-semibold">
          {[
            { id: "rot13", label: "ROT13 / Caesar" },
            { id: "binary", label: "8-Bit Binary" },
            { id: "hex", label: "Hexadecimal" },
            { id: "morse", label: "Morse Code" },
            { id: "leet", label: "1337 Leetspeak" },
            { id: "upsidedown", label: "Inverted Text" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                mode === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}

          {mode === "rot13" && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-gray-500">Caesar Shift ({caesarShift}):</span>
              <input
                type="range"
                min={1}
                max={25}
                value={caesarShift}
                onChange={(e) => setCaesarShift(Number(e.target.value))}
                className="w-24 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Input String
            </span>
            <button
              onClick={() => setInputText("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Obfuscated / Transformed Text
            </span>
            <span className="text-xs font-mono text-gray-400">{outputText.length} chars</span>
          </div>
          <textarea
            readOnly
            rows={18}
            value={outputText}
            placeholder="Transformed output will appear here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
