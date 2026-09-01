"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";

export default function BcryptTester() {
  const [activeTab, setActiveTab] = useState("generate"); // generate | verify

  // Generate Tab State
  const [genPassword, setGenPassword] = useState("password123");
  const [rounds, setRounds] = useState(10);
  const [generatedHash, setGeneratedHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Verify Tab State
  const [verifyPassword, setVerifyPassword] = useState("password123");
  const [verifyHashInput, setVerifyHashInput] = useState(
    "$2b$10$KBlFJM/CVMlQDUik6Kwuje33mjtnhoOqI616K1WbuxPR4KiBuIYb2"
  );
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGenerate = () => {
    if (!genPassword) {
      setGeneratedHash("");
      return;
    }
    setIsHashing(true);
    setTimeout(() => {
      try {
        const salt = bcrypt.genSaltSync(rounds);
        const hash = bcrypt.hashSync(genPassword, salt);
        setGeneratedHash(hash);
      } catch (err) {
        console.error("Bcrypt generation error:", err);
      } finally {
        setIsHashing(false);
      }
    }, 50);
  };

  const handleVerify = () => {
    if (!verifyPassword || !verifyHashInput.trim()) {
      setVerifyResult(null);
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      try {
        const isValid = bcrypt.compareSync(verifyPassword, verifyHashInput.trim());
        setVerifyResult({ valid: isValid });
      } catch {
        setVerifyResult({ valid: false, malformed: true });
      } finally {
        setIsVerifying(false);
      }
    }, 50);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inspect hash structure
  const parseBcrypt = (hash) => {
    const parts = hash.split("$");
    if (parts.length >= 4) {
      const version = `$${parts[1]}$`;
      const cost = parts[2];
      const rest = parts[3];
      const salt = rest.slice(0, 22);
      const checksum = rest.slice(22);
      return { version, cost, salt, checksum, iterations: Math.pow(2, parseInt(cost, 10)) };
    }
    return null;
  };

  const currentInspect = parseBcrypt(generatedHash || verifyHashInput);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Bcrypt Hash Generator & Verifier</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate adaptive Blowfish bcrypt password hashes and verify candidate strings in real-time.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                activeTab === "generate"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              Generate Hash
            </button>
            <button
              onClick={() => setActiveTab("verify")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                activeTab === "verify"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              Verify Hash
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "generate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Options (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
              Hash Parameters
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Plaintext Password
              </label>
              <input
                type="text"
                value={genPassword}
                onChange={(e) => setGenPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Salt Cost Factor (Rounds): {rounds}
                </label>
                <span className="text-xs font-mono text-gray-400">
                  {Math.pow(2, rounds).toLocaleString()} iterations
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="14"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Round 10 is standard production default. Values above 12 take noticeably longer.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isHashing || !genPassword}
              className="w-full py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{isHashing ? "Hashing..." : "Generate Bcrypt Hash"}</span>
            </button>
          </div>

          {/* Generated Hash Display (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Generated Bcrypt Hash
                </span>
                {generatedHash && (
                  <button
                    onClick={() => handleCopy(generatedHash)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    {copied ? "Copied" : "Copy Hash"}
                  </button>
                )}
              </div>

              <div className="p-4 bg-gray-900 text-emerald-400 font-mono text-xs rounded-lg break-all leading-relaxed min-h-16 flex items-center">
                {generatedHash || (
                  <span className="text-gray-500 italic">
                    Click &quot;Generate Bcrypt Hash&quot; to compute hash...
                  </span>
                )}
              </div>

              {/* Anatomy Breakdown */}
              {currentInspect && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                    Hash Anatomy Breakdown
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Version</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{currentInspect.version}</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Cost Factor</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{currentInspect.cost} ({currentInspect.iterations}x)</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Salt</span>
                      <span className="font-mono text-[10px] text-gray-600 dark:text-gray-400 truncate block">{currentInspect.salt}</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Checksum</span>
                      <span className="font-mono text-[10px] text-gray-600 dark:text-gray-400 truncate block">{currentInspect.checksum}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Verify Tab */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Candidate Plaintext Password
              </label>
              <input
                type="text"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Enter password to verify..."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Bcrypt Hash String
              </label>
              <input
                type="text"
                value={verifyHashInput}
                onChange={(e) => setVerifyHashInput(e.target.value)}
                placeholder="$2b$10$..."
                className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleVerify}
              disabled={isVerifying || !verifyPassword || !verifyHashInput}
              className="px-6 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>{isVerifying ? "Verifying..." : "Check Password Match"}</span>
            </button>
          </div>

          {/* Result Card */}
          {verifyResult !== null && (
            <div
              className={`p-5 rounded-xl border flex items-center gap-4 ${
                verifyResult.malformed
                  ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                  : verifyResult.valid
                  ? "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
              }`}
            >
              <div className="shrink-0">
                {verifyResult.malformed ? (
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : verifyResult.valid ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {verifyResult.malformed
                    ? "Invalid Bcrypt Format"
                    : verifyResult.valid
                    ? "Password Matches!"
                    : "Password Does NOT Match"}
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  {verifyResult.malformed
                    ? "The provided hash string does not conform to the standard modular crypt bcrypt format ($2a$ or $2b$)."
                    : verifyResult.valid
                    ? "The candidate plaintext password generates the exact matching checksum for this salt and cost factor."
                    : "The candidate password does not produce the hash provided. Verification failed."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
