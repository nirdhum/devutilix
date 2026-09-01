"use client";

import { useState, useMemo } from "react";

const SAMPLES = {
  blog: {
    title: "How to Build Full-Stack Apps with Next.js App Router and Tailwind CSS v4",
    description: "Learn how to architect, optimize, and deploy lightning-fast web applications using Next.js 15 App Router and Tailwind CSS v4 in this complete guide.",
    url: "https://devutilix.com/blog/nextjs-tailwind-v4-guide",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop",
    siteName: "DevutiliX",
    twitterHandle: "@devutilix",
  },
  saas: {
    title: "DevutiliX - Privacy-First Developer Tools & Utilities Suite",
    description: "37+ essential developer tools running 100% locally in your browser. Format JSON, convert cURL commands, test regex, inspect JWTs, and generate QR codes.",
    url: "https://devutilix.com",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop",
    siteName: "DevutiliX",
    twitterHandle: "@devutilix",
  },
};

export default function SocialPreview() {
  const [data, setData] = useState(SAMPLES.blog);
  const [activeTab, setActiveTab] = useState("google"); // google | twitter | facebook | discord
  const [codeFormat, setCodeFormat] = useState("html"); // html | nextjs
  const [copied, setCopied] = useState(false);

  const titleLength = data.title.length;
  const descLength = data.description.length;

  const domain = useMemo(() => {
    try {
      return new URL(data.url).hostname;
    } catch {
      return "devutilix.com";
    }
  }, [data.url]);

  const htmlMetaCode = useMemo(() => {
    return `<!-- Standard SEO -->
<title>${data.title}</title>
<meta name="description" content="${data.description}">
<link rel="canonical" href="${data.url}">

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website">
<meta property="og:url" content="${data.url}">
<meta property="og:site_name" content="${data.siteName}">
<meta property="og:title" content="${data.title}">
<meta property="og:description" content="${data.description}">
<meta property="og:image" content="${data.image}">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${data.twitterHandle}">
<meta name="twitter:creator" content="${data.twitterHandle}">
<meta name="twitter:title" content="${data.title}">
<meta name="twitter:description" content="${data.description}">
<meta name="twitter:image" content="${data.image}">`;
  }, [data]);

  const nextjsMetadataCode = useMemo(() => {
    return `export const metadata = {
  title: ${JSON.stringify(data.title)},
  description: ${JSON.stringify(data.description)},
  alternates: {
    canonical: ${JSON.stringify(data.url)},
  },
  openGraph: {
    title: ${JSON.stringify(data.title)},
    description: ${JSON.stringify(data.description)},
    url: ${JSON.stringify(data.url)},
    siteName: ${JSON.stringify(data.siteName)},
    images: [
      {
        url: ${JSON.stringify(data.image)},
        width: 1200,
        height: 630,
        alt: ${JSON.stringify(data.title)},
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ${JSON.stringify(data.title)},
    description: ${JSON.stringify(data.description)},
    creator: ${JSON.stringify(data.twitterHandle)},
    images: [${JSON.stringify(data.image)}],
  },
};`;
  }, [data]);

  const handleCopy = () => {
    const code = codeFormat === "html" ? htmlMetaCode : nextjsMetadataCode;
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
              <span>Social Meta Tag & Preview Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Preview how your link will appear across Google Search, Twitter/X, Facebook, and Discord, and generate clean meta tags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Load sample:</span>
            <button
              onClick={() => setData(SAMPLES.blog)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Blog Post
            </button>
            <button
              onClick={() => setData(SAMPLES.saas)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              SaaS Homepage
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-700">
            Metadata Inputs
          </h2>

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Title
              </label>
              <span
                className={`text-[11px] font-mono ${
                  titleLength > 60
                    ? "text-red-500 font-bold"
                    : titleLength >= 40
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {titleLength} / 60 chars
              </span>
            </div>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <span
                className={`text-[11px] font-mono ${
                  descLength > 160
                    ? "text-red-500 font-bold"
                    : descLength >= 120
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {descLength} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Page URL
            </label>
            <input
              type="text"
              value={data.url}
              onChange={(e) => setData({ ...data, url: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Open Graph Image URL (1200x630 recommended)
            </label>
            <input
              type="text"
              value={data.image}
              onChange={(e) => setData({ ...data, image: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Site Name & Twitter Handle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={data.siteName}
                onChange={(e) => setData({ ...data, siteName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Twitter Handle
              </label>
              <input
                type="text"
                value={data.twitterHandle}
                onChange={(e) => setData({ ...data, twitterHandle: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Code Generator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Preview Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            {/* Tabs */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 mb-5 bg-gray-50 dark:bg-gray-900">
              {[
                { id: "google", label: "Google Search" },
                { id: "twitter", label: "Twitter / X" },
                { id: "facebook", label: "Facebook / LinkedIn" },
                { id: "discord", label: "Discord" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Google SERP Preview */}
            {activeTab === "google" && (
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg font-sans">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    {data.siteName.charAt(0) || "D"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-800 dark:text-gray-300 font-medium">
                      {data.siteName}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-sm">
                      {data.url}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg text-blue-800 dark:text-blue-400 hover:underline cursor-pointer font-medium leading-snug">
                  {data.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}

            {/* Twitter Card Preview */}
            {activeTab === "twitter" && (
              <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-black font-sans shadow-sm">
                <div className="relative aspect-[1.91/1] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={data.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/1200x630/1e293b/white?text=Preview+Image";
                    }}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[11px] text-white font-medium">
                    {domain}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {data.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                    {data.description}
                  </p>
                </div>
              </div>
            )}

            {/* Facebook / LinkedIn Preview */}
            {activeTab === "facebook" && (
              <div className="max-w-md mx-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans shadow-sm">
                <div className="aspect-[1.91/1] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={data.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/1200x630/1e293b/white?text=Preview+Image";
                    }}
                  />
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                    {domain}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                    {data.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {data.description}
                  </p>
                </div>
              </div>
            )}

            {/* Discord Embed Preview */}
            {activeTab === "discord" && (
              <div className="max-w-md mx-auto bg-[#2b2d31] p-4 rounded border-l-4 border-blue-500 font-sans text-white text-xs">
                <div className="text-[11px] text-gray-400 font-medium mb-1">
                  {data.siteName}
                </div>
                <h4 className="text-blue-400 font-semibold hover:underline cursor-pointer text-sm mb-1">
                  {data.title}
                </h4>
                <p className="text-gray-300 mb-3 leading-relaxed">
                  {data.description}
                </p>
                <div className="rounded overflow-hidden max-h-48">
                  <img
                    src={data.image}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/1200x630/1e293b/white?text=Preview+Image";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generated Code Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCodeFormat("html")}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    codeFormat === "html"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  HTML &lt;meta&gt;
                </button>
                <button
                  onClick={() => setCodeFormat("nextjs")}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    codeFormat === "nextjs"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  Next.js App Router (metadata)
                </button>
              </div>

              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <pre className="p-3 bg-gray-900 text-gray-100 font-mono text-xs rounded-lg overflow-auto max-h-56 leading-relaxed">
              {codeFormat === "html" ? htmlMetaCode : nextjsMetadataCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
