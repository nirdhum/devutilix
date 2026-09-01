"use client";

import { useState, useMemo } from "react";

const STATUS_CODES = [
  // 1xx
  {
    code: 100,
    phrase: "Continue",
    category: "1xx",
    desc: "The initial part of a request has been received and has not yet been rejected by the server.",
    cause: "Used in Expect: 100-continue handshake before sending large payloads.",
    fix: "Ensure client sends the remaining request body.",
    spec: "RFC 9110, 15.2.1",
  },
  {
    code: 101,
    phrase: "Switching Protocols",
    category: "1xx",
    desc: "The server understands and is willing to comply with the client's request to switch protocols.",
    cause: "Used during WebSocket upgrade handshakes (HTTP/1.1 to WebSocket).",
    fix: "Handled automatically by WebSocket clients and server reverse proxies.",
    spec: "RFC 9110, 15.2.2",
  },
  {
    code: 103,
    phrase: "Early Hints",
    category: "1xx",
    desc: "Used to return some response headers before the final HTTP message is ready (e.g. Link preloads).",
    cause: "Sent by servers while preparing the main HTML body to allow browsers to preload CSS/JS.",
    fix: "Useful for Critical Web Vitals (LCP optimization).",
    spec: "RFC 8297",
  },

  // 2xx
  {
    code: 200,
    phrase: "OK",
    category: "2xx",
    desc: "The request has succeeded. The meaning of the result depends on the HTTP method.",
    cause: "Standard successful response for GET, POST, or PUT.",
    fix: "Everything worked as expected.",
    spec: "RFC 9110, 15.3.1",
  },
  {
    code: 201,
    phrase: "Created",
    category: "2xx",
    desc: "The request has been fulfilled and has resulted in one or more new resources being created.",
    cause: "Returned after a successful POST request creating an entity.",
    fix: "Usually includes a Location header pointing to the newly created resource.",
    spec: "RFC 9110, 15.3.2",
  },
  {
    code: 202,
    phrase: "Accepted",
    category: "2xx",
    desc: "The request has been accepted for processing, but the processing has not been completed.",
    cause: "Used in asynchronous batch processing or queuing background tasks.",
    fix: "Client should poll a job status URL or listen to a webhook/WebSocket for completion.",
    spec: "RFC 9110, 15.3.3",
  },
  {
    code: 204,
    phrase: "No Content",
    category: "2xx",
    desc: "The server has successfully fulfilled the request and there is no additional content to send in the response payload body.",
    cause: "Returned on successful DELETE requests or PUT actions where no body is returned.",
    fix: "Do not parse JSON response body when receiving a 204.",
    spec: "RFC 9110, 15.3.5",
  },
  {
    code: 206,
    phrase: "Partial Content",
    category: "2xx",
    desc: "The server is delivering only part of the resource due to a Range header sent by the client.",
    cause: "Used in media streaming (video/audio) or resumable file downloads.",
    fix: "Verify Range headers and Content-Range response headers.",
    spec: "RFC 9110, 15.3.7",
  },

  // 3xx
  {
    code: 301,
    phrase: "Moved Permanently",
    category: "3xx",
    desc: "The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs.",
    cause: "Permanent domain or route migrations, HTTP to HTTPS redirection.",
    fix: "Update client bookmarks and links to the new Location URL. Browsers cache 301 responses aggressively.",
    spec: "RFC 9110, 15.4.2",
  },
  {
    code: 302,
    phrase: "Found",
    category: "3xx",
    desc: "The target resource resides temporarily under a different URI.",
    cause: "Temporary redirection (e.g. login redirect, A/B testing).",
    fix: "Client should continue to use the original URI for future requests.",
    spec: "RFC 9110, 15.4.3",
  },
  {
    code: 304,
    phrase: "Not Modified",
    category: "3xx",
    desc: "Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.",
    cause: "Browser cache revalidation using ETag or Last-Modified.",
    fix: "Browser loads the cached copy from memory or disk without downloading the body again.",
    spec: "RFC 9110, 15.4.5",
  },
  {
    code: 307,
    phrase: "Temporary Redirect",
    category: "3xx",
    desc: "The target resource resides temporarily under a different URI and the user agent MUST NOT change the request method if it performs an automatic redirection.",
    cause: "Guarantees POST requests remain POST when redirected.",
    fix: "Target URL should accept the original HTTP verb.",
    spec: "RFC 9110, 15.4.8",
  },
  {
    code: 308,
    phrase: "Permanent Redirect",
    category: "3xx",
    desc: "The target resource has been assigned a new permanent URI and the user agent MUST NOT change the request method if it performs an automatic redirection.",
    cause: "Modern permanent redirect that preserves HTTP POST/PUT verbs.",
    fix: "Update canonical links and clients.",
    spec: "RFC 9110, 15.4.9",
  },

  // 4xx
  {
    code: 400,
    phrase: "Bad Request",
    category: "4xx",
    desc: "The server cannot or will not process the request due to something that is perceived to be a client error (e.g. malformed request syntax, invalid query parameters, or deceptive request routing).",
    cause: "Malformed JSON payload, missing required form fields, invalid data types.",
    fix: "Inspect response validation error details and ensure request payload matches schema.",
    spec: "RFC 9110, 15.5.1",
  },
  {
    code: 401,
    phrase: "Unauthorized",
    category: "4xx",
    desc: "The request has not been applied because it lacks valid authentication credentials for the target resource.",
    cause: "Expired JWT token, missing Authorization header, invalid API key.",
    fix: "Prompt user to login or refresh the access token.",
    spec: "RFC 9110, 15.5.2",
  },
  {
    code: 403,
    phrase: "Forbidden",
    category: "4xx",
    desc: "The server understood the request but refuses to authorize it.",
    cause: "User is authenticated, but lacks permissions/role (RBAC) to access the resource, or CORS origin rejected.",
    fix: "Check user roles, API scopes, IP whitelist, or CORS Allowed Origins.",
    spec: "RFC 9110, 15.5.4",
  },
  {
    code: 404,
    phrase: "Not Found",
    category: "4xx",
    desc: "The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.",
    cause: "URL typo, deleted entity, or unmapped route.",
    fix: "Verify URL route path, dynamic parameter IDs, and trailing slashes.",
    spec: "RFC 9110, 15.5.5",
  },
  {
    code: 405,
    phrase: "Method Not Allowed",
    category: "4xx",
    desc: "The method received in the request-line is known by the origin server but not supported by the target resource.",
    cause: "Sending a POST to a route that only supports GET, or missing OPTIONS handler.",
    fix: "Check route definitions and Allow response headers.",
    spec: "RFC 9110, 15.5.6",
  },
  {
    code: 408,
    phrase: "Request Timeout",
    category: "4xx",
    desc: "The server did not receive a complete request message within the time that it was prepared to wait.",
    cause: "Slow network connection, interrupted file upload, or client hung.",
    fix: "Retry the request or verify network connectivity.",
    spec: "RFC 9110, 15.5.9",
  },
  {
    code: 409,
    phrase: "Conflict",
    category: "4xx",
    desc: "The request could not be completed due to a conflict with the current state of the target resource.",
    cause: "Duplicate unique key (e.g. user email already registered), concurrent version mismatch.",
    fix: "Check if resource already exists or implement optimistic locking.",
    spec: "RFC 9110, 15.5.10",
  },
  {
    code: 413,
    phrase: "Payload Too Large",
    category: "4xx",
    desc: "The server is refusing to process a request because the request payload is larger than the server is willing or able to process.",
    cause: "Uploading an image/file that exceeds client_max_body_size or body-parser limit.",
    fix: "Increase Nginx client_max_body_size or compress files client-side before upload.",
    spec: "RFC 9110, 15.5.14",
  },
  {
    code: 415,
    phrase: "Unsupported Media Type",
    category: "4xx",
    desc: "The origin server is refusing to service the request because the payload is in a format not supported by this method on the target resource.",
    cause: "Sending text/plain or multipart/form-data when server expects Content-Type: application/json.",
    fix: "Set the proper Content-Type header on the client request.",
    spec: "RFC 9110, 15.5.16",
  },
  {
    code: 422,
    phrase: "Unprocessable Content",
    category: "4xx",
    desc: "The server understands the content type of the request entity, and the syntax is correct, but was unable to process the contained instructions.",
    cause: "Semantic validation failure (e.g. age must be a positive integer, password too short).",
    fix: "Inspect response body for field validation error objects (Zod, Pydantic, Joi).",
    spec: "RFC 9110, 15.5.21",
  },
  {
    code: 429,
    phrase: "Too Many Requests",
    category: "4xx",
    desc: "The user has sent too many requests in a given amount of time (rate limiting).",
    cause: "API rate limit reached (e.g. 100 requests per minute).",
    fix: "Inspect Retry-After response header and implement exponential backoff with jitter.",
    spec: "RFC 6585",
  },

  // 5xx
  {
    code: 500,
    phrase: "Internal Server Error",
    category: "5xx",
    desc: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
    cause: "Unhandled exceptions, null pointer errors, syntax errors in backend code, database connection drop.",
    fix: "Inspect backend application logs (CloudWatch, Sentry, Datadog, systemd journal).",
    spec: "RFC 9110, 15.6.1",
  },
  {
    code: 502,
    phrase: "Bad Gateway",
    category: "5xx",
    desc: "The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.",
    cause: "Node.js/Next.js/Python backend process is down or crashed behind Nginx or AWS ALB.",
    fix: "Check if the upstream application server is running (e.g. systemctl status myapp).",
    spec: "RFC 9110, 15.6.3",
  },
  {
    code: 503,
    phrase: "Service Unavailable",
    category: "5xx",
    desc: "The server is currently unable to handle the request due to a temporary overload or scheduled maintenance.",
    cause: "Server CPU/memory exhausted, database connection pool saturated, maintenance mode active.",
    fix: "Scale server resources, check database connection limits, inspect health check endpoints.",
    spec: "RFC 9110, 15.6.4",
  },
  {
    code: 504,
    phrase: "Gateway Timeout",
    category: "5xx",
    desc: "The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.",
    cause: "Long-running database query, external API hanging, or backend request timeout exceeded.",
    fix: "Optimize database queries, add indexes, or increase proxy_read_timeout in Nginx.",
    spec: "RFC 9110, 15.6.5",
  },
];

const CATEGORIES = ["All", "1xx", "2xx", "3xx", "4xx", "5xx"];

export default function HTTPStatusCodes() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCode, setSelectedCode] = useState(STATUS_CODES[0]);

  const filteredCodes = useMemo(() => {
    const q = query.toLowerCase().trim();
    return STATUS_CODES.filter((item) => {
      const matchCat = category === "All" || item.category === category;
      if (!matchCat) return false;
      if (!q) return true;

      return (
        item.code.toString().includes(q) ||
        item.phrase.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.cause.toLowerCase().includes(q) ||
        item.fix.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const getBadgeClass = (cat) => {
    switch (cat) {
      case "1xx":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "2xx":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      case "3xx":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "4xx":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "5xx":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>HTTP Status Code Reference</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Searchable reference of all standard HTTP response status codes with RFC specifications, causes, and troubleshooting fixes.
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code (e.g. 404, 502), title, or symptom (e.g. rate limit, cors)..."
              className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  category === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Codes List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <span>Status Codes ({filteredCodes.length})</span>
            {query && <span>Filter: &quot;{query}&quot;</span>}
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-auto pr-1">
            {filteredCodes.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedCode(item)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  selectedCode.code === item.code
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 shadow-sm"
                    : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm font-bold px-2 py-0.5 rounded border ${getBadgeClass(
                      item.category
                    )}`}
                  >
                    {item.code}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {item.phrase}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-gray-400">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Code Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-5">
            {/* Title Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-2xl font-bold px-3 py-1 rounded-lg border ${getBadgeClass(
                      selectedCode.category
                    )}`}
                  >
                    {selectedCode.code}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCode.phrase}
                  </h2>
                </div>
                <span className="text-xs font-mono text-gray-400 mt-1 block">
                  Specification: {selectedCode.spec}
                </span>
              </div>

              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {selectedCode.category === "1xx" && "Informational"}
                {selectedCode.category === "2xx" && "Success"}
                {selectedCode.category === "3xx" && "Redirection"}
                {selectedCode.category === "4xx" && "Client Error"}
                {selectedCode.category === "5xx" && "Server Error"}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Definition
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {selectedCode.desc}
              </p>
            </div>

            {/* Common Causes */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Common Causes</span>
              </h3>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                {selectedCode.cause}
              </p>
            </div>

            {/* How to Fix */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>How to Resolve</span>
              </h3>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                {selectedCode.fix}
              </p>
            </div>

            {/* Node / Next.js Response Snippet */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Example Response Code (Next.js / Express)
              </h3>
              <pre className="p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-lg overflow-auto leading-relaxed border border-gray-800">
{`// Next.js Route Handler (app/api/route.js)
export async function GET() {
  return Response.json(
    { error: "${selectedCode.phrase}" },
    { status: ${selectedCode.code} }
  );
}

// Express.js
res.status(${selectedCode.code}).json({ message: "${selectedCode.phrase}" });`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
