"use client";

import { useState, useRef, useEffect } from "react";

const SIZES = [
  { name: "favicon-16x16.png", size: 16, label: "Browser Tab Small" },
  { name: "favicon-32x32.png", size: 32, label: "Browser Tab Standard" },
  { name: "apple-touch-icon.png", size: 180, label: "Apple iOS Touch Icon" },
  { name: "android-chrome-192x192.png", size: 192, label: "Android PWA Home Screen" },
  { name: "android-chrome-512x512.png", size: 512, label: "PWA Splash Screen" },
];

const SAMPLE_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'><rect width='512' height='512' rx='128' fill='%232563eb'/><path d='M160 160L256 96L352 160V352L256 416L160 352Z' stroke='white' stroke-width='36' fill='none' stroke-linejoin='round'/><circle cx='256' cy='256' r='48' fill='%2360a5fa'/></svg>";

export default function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState(SAMPLE_LOGO);
  const [appName, setAppName] = useState("My Web Application");
  const [shortName, setShortName] = useState("MyApp");
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [generatedUrls, setGeneratedUrls] = useState({});
  const [copiedKey, setCopiedKey] = useState("");
  const fileInputRef = useRef(null);

  // Generate resized icons using HTML5 Canvas
  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (isCancelled) return;
      const urls = {};

      for (const item of SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = item.size;
        canvas.height = item.size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, item.size, item.size);
        urls[item.size] = canvas.toDataURL("image/png");
      }

      setGeneratedUrls(urls);
    };
    img.src = imageSrc;

    return () => {
      isCancelled = true;
    };
  }, [imageSrc]);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadIcon = (size, filename) => {
    const url = generatedUrls[size];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const htmlHeadSnippet = `<!-- Standard Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${themeColor}">`;

  const webManifestSnippet = JSON.stringify(
    {
      name: appName,
      short_name: shortName,
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: themeColor,
      background_color: "#ffffff",
      display: "standalone",
    },
    null,
    2
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Favicon & Web App Icon Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                HTML5 Canvas (Zero Upload)
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate standard favicon.ico, Apple Touch icons, Android PWA assets, and HTML meta tags.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Master Logo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings & Master Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Source Image & PWA Settings
          </h2>

          <div className="w-32 h-32 mx-auto rounded-2xl p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <img src={imageSrc} alt="Master Logo" className="w-full h-full object-contain rounded-xl" />
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Application Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Short Name
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generated Icons Grid & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block pb-2 border-b border-gray-100 dark:border-gray-700">
              Generated Icon Assets ({SIZES.length})
            </span>

            <div className="space-y-2.5">
              {SIZES.map((item) => (
                <div
                  key={item.size}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-1">
                      {generatedUrls[item.size] && (
                        <img
                          src={generatedUrls[item.size]}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-mono font-bold text-gray-900 dark:text-white block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {item.label} ({item.size}x{item.size})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadIcon(item.size, item.name)}
                    className="px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    ⬇ Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HTML and Webmanifest Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  HTML &lt;head&gt; Snippet
                </span>
                <button
                  onClick={() => handleCopy(htmlHeadSnippet, "html")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {copiedKey === "html" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-cyan-300 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-40">
                {htmlHeadSnippet}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  site.webmanifest
                </span>
                <button
                  onClick={() => handleCopy(webManifestSnippet, "manifest")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {copiedKey === "manifest" ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-amber-300 font-mono text-[11px] rounded-lg overflow-auto leading-relaxed max-h-40">
                {webManifestSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
