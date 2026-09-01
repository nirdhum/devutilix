"use client";

import { useState, useEffect, useMemo } from "react";

const PRESETS = [
  {
    name: "iPhone 16 Pro (Safari)",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  },
  {
    name: "Windows 11 (Edge)",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  },
  {
    name: "Pixel 9 Pro (Chrome)",
    ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
  },
  {
    name: "macOS Sequoia (Safari)",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  },
  {
    name: "Googlebot Desktop",
    ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
];

function parseUA(uaString) {
  const ua = (uaString || "").trim();
  if (!ua) return null;

  // 1. Bot check
  let isBot = false;
  let botName = null;
  const botRegexes = [
    { name: "Googlebot", reg: /Googlebot/i },
    { name: "Bingbot", reg: /Bingbot/i },
    { name: "DuckDuckBot", reg: /DuckDuckBot/i },
    { name: "Baiduspider", reg: /Baiduspider/i },
    { name: "YandexBot", reg: /YandexBot/i },
    { name: "Twitterbot", reg: /Twitterbot/i },
    { name: "Discordbot", reg: /Discordbot/i },
    { name: "Facebookbot", reg: /facebookexternalhit/i },
    { name: "curl", reg: /^curl\//i },
    { name: "Postman", reg: /PostmanRuntime/i },
  ];
  for (const b of botRegexes) {
    if (b.reg.test(ua)) {
      isBot = true;
      botName = b.name;
      break;
    }
  }

  // 2. Browser detection
  let browser = "Unknown";
  let version = "Unknown";

  if (/Edg(?:e|A|IOS)?\/([\d.]+)/i.test(ua)) {
    browser = "Microsoft Edge";
    version = ua.match(/Edg(?:e|A|IOS)?\/([\d.]+)/i)?.[1] || "";
  } else if (/OPR\/([\d.]+)/i.test(ua) || /Opera\/([\d.]+)/i.test(ua)) {
    browser = "Opera";
    version = ua.match(/(?:OPR|Opera)\/([\d.]+)/i)?.[1] || "";
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    browser = "Samsung Internet";
    version = ua.match(/SamsungBrowser\/([\d.]+)/i)?.[1] || "";
  } else if (/Firefox\/([\d.]+)/i.test(ua) || /FxiOS\/([\d.]+)/i.test(ua)) {
    browser = "Mozilla Firefox";
    version = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/i)?.[1] || "";
  } else if (/Chrome\/([\d.]+)/i.test(ua) || /CriOS\/([\d.]+)/i.test(ua)) {
    browser = "Google Chrome";
    version = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/i)?.[1] || "";
  } else if (/Version\/([\d.]+).*Safari/i.test(ua)) {
    browser = "Apple Safari";
    version = ua.match(/Version\/([\d.]+)/i)?.[1] || "";
  } else if (isBot) {
    browser = botName;
    version = "Bot / Crawler";
  }

  // 3. Engine
  let engine = "Unknown";
  if (/Blink/i.test(ua) || (browser === "Google Chrome" && !/AppleWebKit\/605/i.test(ua))) {
    engine = "Blink";
  } else if (/Gecko\/[\d.]+/i.test(ua) && !/like Gecko/i.test(ua)) {
    engine = "Gecko";
  } else if (/AppleWebKit/i.test(ua)) {
    engine = "WebKit";
  } else if (/Trident/i.test(ua)) {
    engine = "Trident";
  }

  // 4. OS
  let os = "Unknown";
  let osVersion = "";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
    const vMatch = ua.match(/OS (\d+[_\d]*)/i);
    if (vMatch) osVersion = vMatch[1].replace(/_/g, ".");
  } else if (/Android/i.test(ua)) {
    os = "Android";
    const vMatch = ua.match(/Android (\d+(\.\d+)*)/i);
    if (vMatch) osVersion = vMatch[1];
  } else if (/Mac OS X/i.test(ua)) {
    os = "macOS";
    const vMatch = ua.match(/Mac OS X (\d+[_\d]*)/i);
    if (vMatch) osVersion = vMatch[1].replace(/_/g, ".");
  } else if (/Windows/i.test(ua)) {
    os = "Windows";
    if (/Windows NT 10.0/i.test(ua)) osVersion = "10 or 11";
    else if (/Windows NT 6.3/i.test(ua)) osVersion = "8.1";
    else if (/Windows NT 6.1/i.test(ua)) osVersion = "7";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  // 5. Device Type
  let deviceType = "Desktop";
  if (isBot) {
    deviceType = "Bot / Web Crawler";
  } else if (/iPad|Tablet/i.test(ua)) {
    deviceType = "Tablet";
  } else if (/Mobile|iPhone|Android.*Mobile/i.test(ua)) {
    deviceType = "Mobile (Phone)";
  }

  return {
    browser,
    version,
    engine,
    os,
    osVersion,
    deviceType,
    isBot,
    botName,
  };
}

export default function UserAgentParser() {
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  const parsed = useMemo(() => parseUA(userAgent), [userAgent]);

  const handleUseMyBrowser = () => {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      setUserAgent(navigator.userAgent);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>User-Agent Parser & Tester</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Extract browser version, OS, rendering engine, device category, and bot crawler identities.
            </p>
          </div>

          <button
            onClick={handleUseMyBrowser}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Use My Current Browser</span>
          </button>
        </div>

        {/* Device Presets */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setUserAgent(p.ua)}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Textarea */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            User-Agent String
          </label>
          <span className="text-xs text-gray-400 font-mono">{userAgent.length} characters</span>
        </div>
        <textarea
          rows={3}
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
          placeholder="Paste any User-Agent string..."
          className="w-full p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Breakdown Cards */}
      {parsed && (
        <div className="space-y-4">
          {/* Top 4 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Browser
              </span>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {parsed.browser}
              </div>
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 block">
                v{parsed.version}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Operating System
              </span>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {parsed.os}
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 block">
                {parsed.osVersion || "Unknown"}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Device Form Factor
              </span>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {parsed.deviceType}
              </div>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 block">
                {parsed.isBot ? "Crawler" : "End User"}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Rendering Engine
              </span>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {parsed.engine}
              </div>
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 block">
                Layout Core
              </span>
            </div>
          </div>

          {/* Bot Alert if Bot */}
          {parsed.isBot && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <span className="font-bold block">Automated Bot / Search Engine Crawler Detected</span>
                <span>
                  This agent identifies as <strong>{parsed.botName}</strong>. Typically used by indexers, link prefetchers, or API CLI tools.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
