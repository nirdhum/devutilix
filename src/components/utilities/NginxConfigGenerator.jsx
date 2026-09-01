"use client";

import { useState, useMemo } from "react";

export default function NginxConfigGenerator() {
  const [domain, setDomain] = useState("example.com");
  const [proxyPass, setProxyPass] = useState("http://127.0.0.1:3000");
  const [sslEnabled, setSslEnabled] = useState(true);
  const [redirectHttp, setRedirectHttp] = useState(true);
  const [webSockets, setWebSockets] = useState(true);
  const [gzip, setGzip] = useState(true);
  const [securityHeaders, setSecurityHeaders] = useState(true);
  const [staticCache, setStaticCache] = useState(true);
  const [maxBodySize, setMaxBodySize] = useState("50M");
  const [copied, setCopied] = useState(false);

  const config = useMemo(() => {
    const cleanDomain = domain.trim() || "example.com";
    const cleanProxy = proxyPass.trim() || "http://127.0.0.1:3000";

    let conf = "";

    // HTTP redirect block if SSL is active
    if (sslEnabled && redirectHttp) {
      conf += `# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [:::80];
    server_name ${cleanDomain} www.${cleanDomain};

    return 301 https://$host$request_uri;
}

`;
    }

    // Main server block
    conf += `server {
`;

    if (sslEnabled) {
      conf += `    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${cleanDomain} www.${cleanDomain};

    # SSL Certificates (Let's Encrypt default path)
    ssl_certificate /etc/letsencrypt/live/${cleanDomain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${cleanDomain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
`;
    } else {
      conf += `    listen 80;
    listen [::]:80;
    server_name ${cleanDomain} www.${cleanDomain};
`;
    }

    conf += `
    client_max_body_size ${maxBodySize};
`;

    if (securityHeaders) {
      conf += `
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
`;
      if (sslEnabled) {
        conf += `    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\n`;
      }
    }

    if (gzip) {
      conf += `
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
`;
    }

    if (staticCache) {
      conf += `
    # Cache Static Next.js / Static Assets
    location /_next/static/ {
        proxy_pass ${cleanProxy};
        proxy_set_header Host $host;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2)$ {
        proxy_pass ${cleanProxy};
        proxy_set_header Host $host;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, no-transform";
    }
`;
    }

    // Main location block
    conf += `
    # Main Proxy Location
    location / {
        proxy_pass ${cleanProxy};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
`;

    if (webSockets) {
      conf += `
        # WebSocket Support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
`;
    }

    conf += `    }
}`;

    return conf;
  }, [
    domain,
    proxyPass,
    sslEnabled,
    redirectHttp,
    webSockets,
    gzip,
    securityHeaders,
    staticCache,
    maxBodySize,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(config);
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
              <span>Nginx Reverse Proxy Config Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate production-ready Nginx server configurations with SSL, WebSocket proxying, gzip, and security headers.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {copied ? (
              <span>Copied!</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Config</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Options (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Server Parameters
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Proxy Pass Target (Backend / Next.js)
            </label>
            <input
              type="text"
              value={proxyPass}
              onChange={(e) => setProxyPass(e.target.value)}
              placeholder="http://127.0.0.1:3000"
              className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Client Max Body Size
            </label>
            <input
              type="text"
              value={maxBodySize}
              onChange={(e) => setMaxBodySize(e.target.value)}
              placeholder="50M"
              className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2.5">
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Enable SSL / HTTPS
              </span>
              <input
                type="checkbox"
                checked={sslEnabled}
                onChange={(e) => setSslEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </label>

            {sslEnabled && (
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ml-2">
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Redirect HTTP ➔ HTTPS
                </span>
                <input
                  type="checkbox"
                  checked={redirectHttp}
                  onChange={(e) => setRedirectHttp(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
              </label>
            )}

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                WebSocket Proxy Headers
              </span>
              <input
                type="checkbox"
                checked={webSockets}
                onChange={(e) => setWebSockets(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Security Headers (HSTS, X-Frame)
              </span>
              <input
                type="checkbox"
                checked={securityHeaders}
                onChange={(e) => setSecurityHeaders(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Gzip Compression
              </span>
              <input
                type="checkbox"
                checked={gzip}
                onChange={(e) => setGzip(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Static Asset Caching Rules
              </span>
              <input
                type="checkbox"
                checked={staticCache}
                onChange={(e) => setStaticCache(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Generated Config & Instructions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Generated nginx.conf
              </span>
              <span className="text-xs font-mono text-gray-400">
                /etc/nginx/sites-available/{domain || "example.com"}
              </span>
            </div>

            <pre className="w-full min-h-[380px] font-mono text-xs p-3 bg-gray-900 text-gray-100 border border-gray-800 rounded-lg overflow-auto leading-relaxed">
              {config}
            </pre>
          </div>

          {/* Quick Deployment Helper */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm text-xs space-y-2">
            <span className="font-bold text-gray-900 dark:text-white block uppercase tracking-wider text-[11px]">
              How to deploy on Ubuntu/Debian server:
            </span>
            <div className="space-y-1.5 font-mono text-gray-700 dark:text-gray-300">
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                1. sudo nano /etc/nginx/sites-available/{domain || "example.com"}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                2. sudo ln -s /etc/nginx/sites-available/{domain || "example.com"} /etc/nginx/sites-enabled/
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-green-600 dark:text-green-400 font-bold">
                3. sudo nginx -t && sudo systemctl reload nginx
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
