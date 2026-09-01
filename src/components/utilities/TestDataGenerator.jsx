"use client";

import { useState, useMemo } from "react";

// Calculate Luhn check digit for card number prefix
function generateLuhnNumber(prefix, length) {
  let num = prefix;
  while (num.length < length - 1) {
    num += Math.floor(Math.random() * 10);
  }

  // Calculate check digit
  let sum = 0;
  let double = true;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return num + checkDigit;
}

// Generate MOD-97 compliant mock IBAN
function generateMockIban(countryCode) {
  const bbanLengths = { DE: 18, GB: 18, FR: 23, NL: 14 };
  const len = bbanLengths[countryCode] || 18;
  let bban = "";
  for (let i = 0; i < len; i++) {
    bban += Math.floor(Math.random() * 10);
  }

  // Calculate check digits for countryCode + 00
  // Country to numeric (A=10, B=11...)
  const c1 = countryCode.charCodeAt(0) - 55;
  const c2 = countryCode.charCodeAt(1) - 55;
  const numericStr = `${bban}${c1}${c2}00`;

  // Modulo 97 on large numeric string
  let remainder = 0;
  for (let i = 0; i < numericStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numericStr[i], 10)) % 97;
  }
  const checkDigit = String(98 - remainder).padStart(2, "0");

  return `${countryCode}${checkDigit}${bban}`;
}

export default function TestDataGenerator() {
  const [cardType, setCardType] = useState("visa"); // visa | mastercard | amex | discover
  const [ibanCountry, setIbanCountry] = useState("DE");
  const [seed, setSeed] = useState(0);
  const [copiedKey, setCopiedKey] = useState("");

  const generatedCard = useMemo(() => {
    let num = "";
    let cvv = "";
    const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const expYear = String(new Date().getFullYear() + Math.floor(Math.random() * 4) + 1).slice(-2);

    if (cardType === "visa") {
      num = generateLuhnNumber("4", 16);
      cvv = String(Math.floor(Math.random() * 900) + 100);
    } else if (cardType === "mastercard") {
      const p = String(Math.floor(Math.random() * 5) + 51);
      num = generateLuhnNumber(p, 16);
      cvv = String(Math.floor(Math.random() * 900) + 100);
    } else if (cardType === "amex") {
      const p = Math.random() > 0.5 ? "34" : "37";
      num = generateLuhnNumber(p, 15);
      cvv = String(Math.floor(Math.random() * 9000) + 1000);
    } else if (cardType === "discover") {
      num = generateLuhnNumber("6011", 16);
      cvv = String(Math.floor(Math.random() * 900) + 100);
    }

    return {
      type: cardType.toUpperCase(),
      number: num,
      formatted: num.match(/.{1,4}/g)?.join(" ") || num,
      expiry: `${expMonth}/${expYear}`,
      cvv,
      name: "TEST DEVELOPER",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardType, seed]);

  const generatedIban = useMemo(() => {
    return generateMockIban(ibanCountry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ibanCountry, seed]);

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
              <span>Credit Card & IBAN Test Data Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Luhn Algorithm
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate Luhn-compliant test payment numbers and valid MOD-97 IBANs for test suite verification.
            </p>
          </div>

          <button
            onClick={() => setSeed((s) => s + 1)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate New Test Data
          </button>
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            <strong>Sandbox Notice:</strong> Generated numbers are strictly synthetic test artifacts for unit tests and payment gateway test suites (Stripe, Braintree, Adyen). They hold zero real-world value.
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Synthetic Card Generator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Synthetic Test Card
            </span>
            <div className="flex gap-1 text-[11px] font-bold">
              {["visa", "mastercard", "amex", "discover"].map((t) => (
                <button
                  key={t}
                  onClick={() => setCardType(t)}
                  className={`px-2 py-0.5 rounded uppercase cursor-pointer ${
                    cardType === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Realistic Card Visual */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white shadow-lg space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-200">
                SANDBOX TEST CARD
              </span>
              <span className="text-sm font-black font-mono tracking-wider">{generatedCard.type}</span>
            </div>

            <div className="font-mono text-xl tracking-widest text-center py-2 select-all font-bold">
              {generatedCard.formatted}
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">Cardholder</span>
                <span className="font-bold">{generatedCard.name}</span>
              </div>
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">Expires</span>
                <span className="font-bold">{generatedCard.expiry}</span>
              </div>
              <div>
                <span className="text-[9px] text-indigo-300 uppercase block">CVV</span>
                <span className="font-bold">{generatedCard.cvv}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(generatedCard.number, "cardNum")}
              className="flex-1 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer text-center"
            >
              {copiedKey === "cardNum" ? "✓ Copied!" : "Copy Card Number"}
            </button>
            <button
              onClick={() =>
                handleCopy(
                  `Card: ${generatedCard.number}\nExp: ${generatedCard.expiry}\nCVV: ${generatedCard.cvv}`,
                  "cardAll"
                )
              }
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {copiedKey === "cardAll" ? "✓ Copied All!" : "Copy All Details"}
            </button>
          </div>
        </div>

        {/* Synthetic IBAN Generator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Synthetic Test IBAN
            </span>
            <div className="flex gap-1 text-[11px] font-bold">
              {[
                { code: "DE", name: "Germany" },
                { code: "GB", name: "UK" },
                { code: "FR", name: "France" },
                { code: "NL", name: "Netherlands" },
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => setIbanCountry(c.code)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    ibanCountry === c.code
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                MOD-97 Validated IBAN
              </span>
              <div className="font-mono text-base font-bold text-gray-900 dark:text-white break-all select-all">
                {generatedIban}
              </div>
            </div>

            <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Country Code:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{ibanCountry}</span>
              </div>
              <div className="flex justify-between">
                <span>Check Digits:</span>
                <span className="font-mono font-bold text-emerald-600">{generatedIban.slice(2, 4)}</span>
              </div>
              <div className="flex justify-between">
                <span>BBAN:</span>
                <span className="font-mono text-gray-500">{generatedIban.slice(4)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopy(generatedIban, "iban")}
            className="w-full py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
          >
            {copiedKey === "iban" ? "✓ Copied IBAN!" : "Copy IBAN"}
          </button>
        </div>
      </div>
    </div>
  );
}
