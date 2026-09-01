import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - DevutiliX",
  description:
    "DevutiliX privacy policy: 100% client-side computing, zero tracking, zero server logging, and absolute data privacy.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="space-y-3">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Privacy Policy</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: September 1, 2026 • Version 2.0
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Client-Side Architecture
            </div>
          </div>
        </div>

        {/* Core Guarantee Highlight Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg space-y-3">
          <h2 className="text-lg sm:text-xl font-bold">Our Absolute Privacy Guarantee</h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            At DevutiliX, privacy is not an afterthought or an optional setting—it is the foundational core of our architecture. Every single utility executes <strong>100% locally in your web browser</strong>. Your text, code, passwords, JWT tokens, images, and keys are never uploaded to any remote server or third-party cloud.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-xs space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>1. Zero Server-Side Processing</span>
            </h3>
            <p>
              When you paste or type sensitive data into any DevutiliX tool (such as the <strong>JSON Formatter</strong>, <strong>JWT Debugger</strong>, <strong>Bcrypt Tester</strong>, <strong>HMAC Generator</strong>, <strong>EXIF Remover</strong>, or <strong>SQL Converter</strong>):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <li>
                Calculations and transformations are handled entirely via client-side JavaScript, Web Workers, and the standard W3C Web Crypto API.
              </li>
              <li>
                Your inputs and generated outputs remain strictly in your computer&apos;s active RAM memory and are never transmitted across HTTP/HTTPS networks.
              </li>
              <li>
                You can disconnect your internet connection (airplane mode) after loading the site, and all utilities will continue working normally.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>2. No Tracking, Analytics, or Fingerprinting</span>
            </h3>
            <p>
              We believe developers deserve an uncompromised development environment:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <li>No tracking cookies or marketing beacons.</li>
              <li>No Google Analytics, Meta Pixel, or behavioral tracking telemetry.</li>
              <li>No fingerprinting or session replay scripts (e.g. Hotjar or FullStory).</li>
              <li>No third-party ad networks.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>3. Local Storage Usage</span>
            </h3>
            <p>
              DevutiliX utilizes your browser&apos;s isolated <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono">localStorage</code> solely to preserve your preferred user settings across visits:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block">
                  devutilix_theme
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  Saves your Dark or Light mode appearance choice.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  devutilix_favorites
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  Saves your starred/pinned utilities for instant top-shelf access.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 block">
                  devutilix_recents
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  Saves your last 5 visited tools for the Command Palette (⌘K).
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-1">
              This data never leaves your device and can be cleared at any moment by clearing your browser cache or site data.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>4. Open Source & Verifiable</span>
            </h3>
            <p>
              Don&apos;t just take our word for it. All DevutiliX source code is publicly accessible and transparent. You can inspect the network tab in your browser&apos;s developer tools or review the open codebase on{" "}
              <a
                href="https://github.com/nirdhum/devutilix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                GitHub
              </a>{" "}
              to verify that zero network requests are dispatched when executing utilities.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>5. Contact Us</span>
            </h3>
            <p>
              If you have any questions, suggestions, or would like to submit a security audit regarding DevutiliX, feel free to reach out directly via{" "}
              <a
                href="https://nirdhum.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                nirdhum.in
              </a>{" "}
              or by opening an issue on our GitHub repository.
            </p>
          </section>
        </div>

        {/* Return Button */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            ← Return to Utilities
          </Link>
        </div>
      </div>
    </main>
  );
}
