"use client";

import { useState, useMemo } from "react";

const SAMPLES = {
  secure:
    "session_token=s_98f1a23c4d5e; Domain=api.devutilix.com; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400",
  insecure:
    "user_id=12345; Path=/; Expires=Wed, 21 Oct 2027 07:28:00 GMT",
  crosssite:
    "tracking_id=tr_abc999; Domain=.example.com; Path=/; SameSite=None; Secure; Partitioned",
};

export default function CookieInspector() {
  const [cookieString, setCookieString] = useState(SAMPLES.secure);
  const [copiedKey, setCopiedKey] = useState("");

  const parsed = useMemo(() => {
    let raw = cookieString.trim();
    if (raw.toLowerCase().startsWith("set-cookie:")) {
      raw = raw.replace(/^set-cookie:\s*/i, "");
    }
    if (!raw) return null;

    const parts = raw.split(";").map((p) => p.trim());
    if (parts.length === 0) return null;

    const [firstPart, ...directives] = parts;
    const eqIdx = firstPart.indexOf("=");
    const name = eqIdx !== -1 ? firstPart.slice(0, eqIdx) : firstPart;
    const value = eqIdx !== -1 ? firstPart.slice(eqIdx + 1) : "";

    const attrs = {
      name,
      value,
      domain: null,
      path: null,
      expires: null,
      maxAge: null,
      sameSite: null,
      secure: false,
      httpOnly: false,
      partitioned: false,
    };

    for (const d of directives) {
      const dEq = d.indexOf("=");
      const dKey = (dEq !== -1 ? d.slice(0, dEq) : d).toLowerCase();
      const dVal = dEq !== -1 ? d.slice(dEq + 1) : "";

      if (dKey === "domain") attrs.domain = dVal;
      else if (dKey === "path") attrs.path = dVal;
      else if (dKey === "expires") attrs.expires = dVal;
      else if (dKey === "max-age") attrs.maxAge = parseInt(dVal, 10);
      else if (dKey === "samesite") attrs.sameSite = dVal;
      else if (dKey === "secure") attrs.secure = true;
      else if (dKey === "httponly") attrs.httpOnly = true;
      else if (dKey === "partitioned") attrs.partitioned = true;
    }

    // Security Audit findings
    const issues = [];
    if (!attrs.httpOnly) {
      issues.push({
        severity: "warning",
        title: "Missing HttpOnly Flag",
        desc: "Cookie can be read by JavaScript via document.cookie, making it vulnerable to Cross-Site Scripting (XSS) credential theft.",
      });
    }
    if (!attrs.secure) {
      issues.push({
        severity: "danger",
        title: "Missing Secure Attribute",
        desc: "Cookie will be transmitted over unencrypted plaintext HTTP connections, vulnerable to man-in-the-middle interception.",
      });
    }
    if (attrs.sameSite?.toLowerCase() === "none" && !attrs.secure) {
      issues.push({
        severity: "danger",
        title: "SameSite=None Without Secure",
        desc: "Modern browsers (Chrome, Safari, Firefox) unconditionally reject any cookie set with SameSite=None unless the Secure flag is present.",
      });
    }

    return { ...attrs, issues };
  }, [cookieString]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const nextJsSnippet = parsed
    ? `// Next.js Server Action or Route Handler (next/headers)
import { cookies } from "next/headers";

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set("${parsed.name}", "${parsed.value}", {
    httpOnly: ${parsed.httpOnly},
    secure: ${parsed.secure},
    sameSite: "${parsed.sameSite || "lax"}",
    path: "${parsed.path || "/"}",
    ${parsed.maxAge ? `maxAge: ${parsed.maxAge},` : ""}
    ${parsed.domain ? `domain: "${parsed.domain}",` : ""}
  });
}`
    : "";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Cookie & Storage Header Inspector</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Security Audit
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Inspect Set-Cookie headers for SameSite, HttpOnly, and Secure flags, and audit security vulnerabilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Samples:</span>
            <button
              onClick={() => setCookieString(SAMPLES.secure)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 cursor-pointer"
            >
              Secure Session
            </button>
            <button
              onClick={() => setCookieString(SAMPLES.insecure)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 cursor-pointer"
            >
              Insecure Cookie
            </button>
          </div>
        </div>
      </div>

      {/* Input Textarea */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Set-Cookie Header / Raw Cookie String
          </label>
          <button
            onClick={() => setCookieString("")}
            className="text-xs text-red-500 hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
        <textarea
          rows={3}
          value={cookieString}
          onChange={(e) => setCookieString(e.target.value)}
          placeholder="Paste Set-Cookie: name=value; Path=/; Secure; HttpOnly..."
          className="w-full p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {parsed && (
        <div className="space-y-6">
          {/* Audit Results */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block pb-2 border-b border-gray-100 dark:border-gray-700">
              Security Posture Audit
            </span>

            {parsed.issues.length === 0 ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl flex items-center gap-3 text-green-800 dark:text-green-300 text-xs">
                <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <span className="font-bold block">Excellent Cookie Security Configuration</span>
                  <span>
                    This cookie implements HttpOnly, Secure transport, and SameSite restrictions according to OWASP guidelines.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {parsed.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                      iss.severity === "danger"
                        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {iss.severity === "danger" ? (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <span className="font-bold block">{iss.title}</span>
                      <p className="mt-0.5 opacity-90 leading-relaxed">{iss.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parsed Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Name</span>
              <span className="font-mono font-bold text-sm text-gray-900 dark:text-white truncate block">{parsed.name}</span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">HttpOnly</span>
              <span className={`font-mono font-bold text-sm block ${parsed.httpOnly ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {parsed.httpOnly ? "✓ True" : "✕ False"}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Secure (HTTPS)</span>
              <span className={`font-mono font-bold text-sm block ${parsed.secure ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {parsed.secure ? "✓ True" : "✕ False"}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">SameSite Policy</span>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 block">
                {parsed.sameSite || "Not Set (Lax)"}
              </span>
            </div>
          </div>

          {/* Code Generator Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Next.js App Router Code Snippet
              </span>
              <button
                onClick={() => handleCopy(nextJsSnippet, "snip")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {copiedKey === "snip" ? "✓ Copied!" : "Copy Snippet"}
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-cyan-300 font-mono text-xs rounded-lg overflow-auto leading-relaxed">
              {nextJsSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
