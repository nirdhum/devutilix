"use client";

import { useState, useMemo } from "react";
import yaml from "js-yaml";

const SAMPLE_YAML = `openapi: 3.0.0
info:
  title: DevutiliX Cloud API
  version: 1.0.0
  description: Secure developer utility API endpoints for auth and transformation.
servers:
  - url: https://api.devutilix.com/v1
paths:
  /auth/login:
    post:
      summary: User Authentication
      tags: [Authentication]
      description: Exchanges credentials for a JWT bearer token.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Successful authentication
        '401':
          description: Invalid credentials
  /utilities/tools:
    get:
      summary: List all active utilities
      tags: [Utilities]
      parameters:
        - name: category
          in: query
          required: false
          schema:
            type: string
        - name: limit
          in: query
          required: false
          schema:
            type: integer
      responses:
        '200':
          description: Array of active developer tools
  /utilities/{id}:
    get:
      summary: Get utility by ID
      tags: [Utilities]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Detailed utility configuration
        '404':
          description: Utility not found`;

export default function SwaggerViewer() {
  const [specInput, setSpecInput] = useState(SAMPLE_YAML);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [expandedEndpoints, setExpandedEndpoints] = useState({ 0: true });

  // Parse YAML or JSON into OpenAPI structure
  const parsedSpec = useMemo(() => {
    try {
      const clean = specInput.trim();
      if (!clean) return null;
      let obj;
      if (clean.startsWith("{") || clean.startsWith("[")) {
        obj = JSON.parse(clean);
      } else {
        obj = yaml.load(clean);
      }
      return { data: obj, error: null };
    } catch (err) {
      return { data: null, error: err.message || "Invalid YAML or JSON specification" };
    }
  }, [specInput]);

  // Extract endpoints list
  const endpoints = useMemo(() => {
    if (!parsedSpec?.data?.paths) return [];
    const list = [];
    const paths = parsedSpec.data.paths;

    for (const pathKey of Object.keys(paths)) {
      const pathObj = paths[pathKey];
      const methods = ["get", "post", "put", "delete", "patch", "options", "head"];

      for (const m of methods) {
        if (pathObj[m]) {
          const ep = pathObj[m];
          list.push({
            path: pathKey,
            method: m.toUpperCase(),
            summary: ep.summary || "",
            description: ep.description || "",
            tags: ep.tags || ["Default"],
            parameters: ep.parameters || [],
            requestBody: ep.requestBody || null,
            responses: ep.responses || {},
          });
        }
      }
    }
    return list;
  }, [parsedSpec]);

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return endpoints.filter((ep) => {
      const matchMethod = methodFilter === "ALL" || ep.method === methodFilter;
      if (!matchMethod) return false;
      if (!q) return true;

      return (
        ep.path.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [endpoints, searchQuery, methodFilter]);

  const toggleEndpoint = (idx) => {
    setExpandedEndpoints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getMethodBadgeClass = (m) => {
    switch (m) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-300 dark:border-green-800";
      case "PUT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800";
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>OpenAPI & Swagger Spec Viewer</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                YAML / JSON
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualize OpenAPI 3.0 and Swagger API specifications with endpoint schemas, parameters, and responses.
            </p>
          </div>

          <button
            onClick={() => setSpecInput(SAMPLE_YAML)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            Load Sample API Spec
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Specification Code Input (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              OpenAPI YAML / JSON Input
            </span>
            <button
              onClick={() => setSpecInput("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={20}
            value={specInput}
            onChange={(e) => setSpecInput(e.target.value)}
            placeholder="Paste OpenAPI 3.0 / Swagger YAML or JSON..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
          {parsedSpec?.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {parsedSpec.error}
            </div>
          )}
        </div>

        {/* Rendered API Documentation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* API Title Card */}
          {parsedSpec?.data?.info && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {parsedSpec.data.info.title || "API Documentation"}
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                  v{parsedSpec.data.info.version || "1.0.0"}
                </span>
              </div>
              {parsedSpec.data.info.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {parsedSpec.data.info.description}
                </p>
              )}
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints by path or tag..."
              className="flex-1 w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto text-[11px] font-bold">
              {["ALL", "GET", "POST", "PUT", "DELETE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                    methodFilter === m
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints Accordion List */}
          <div className="space-y-2.5 max-h-[520px] overflow-auto pr-1">
            {filteredEndpoints.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-500">
                No matching endpoints found.
              </div>
            ) : (
              filteredEndpoints.map((ep, idx) => {
                const isExpanded = !!expandedEndpoints[idx];
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-all"
                  >
                    {/* Header Row */}
                    <button
                      onClick={() => toggleEndpoint(idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border ${getMethodBadgeClass(
                            ep.method
                          )}`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white truncate">
                          {ep.path}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 space-y-3 text-xs">
                        {ep.summary && (
                          <div className="text-gray-800 dark:text-gray-200 font-semibold">
                            {ep.summary}
                          </div>
                        )}
                        {ep.description && (
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {ep.description}
                          </p>
                        )}

                        {/* Parameters */}
                        {ep.parameters.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                              Parameters
                            </span>
                            <div className="space-y-1">
                              {ep.parameters.map((p, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] px-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      {p.in}
                                    </span>
                                    {p.required && (
                                      <span className="text-[10px] text-red-500 font-bold">
                                        required
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[10px] text-gray-400">
                                    {p.schema?.type || "string"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Responses */}
                        {Object.keys(ep.responses).length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                              Responses
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(ep.responses).map(([code, r]) => (
                                <div
                                  key={code}
                                  className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                                >
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                                      code.startsWith("2")
                                        ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                                        : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                                    }`}
                                  >
                                    {code}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400 text-[11px]">
                                    {r.description || "Response"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
