"use client";

import { useState, useMemo } from "react";

const DOCKERFILE_TEMPLATES = {
  nextjs: `# Multi-stage Dockerfile for Next.js App Router
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]`,

  node: `# Node.js Express API
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Run as non-root user for security
USER node

EXPOSE 8080
ENV NODE_ENV=production

CMD ["node", "src/index.js"]`,

  python: `# Python FastAPI / Flask
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
};

const COMPOSE_TEMPLATES = {
  fullstack: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:secret@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret_password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: always

volumes:
  pgdata:`,
};

function lintDockerfile(content) {
  const lines = content.split("\n");
  const issues = [];
  let hasFrom = false;
  let hasUser = false;
  let cmdCount = 0;
  let hasWorkdir = false;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) return;

    const parts = line.split(/\s+/);
    const instruction = parts[0].toUpperCase();

    if (instruction === "FROM") {
      hasFrom = true;
      const image = parts[1] || "";
      if (image.endsWith(":latest") || (!image.includes(":") && !image.includes("@"))) {
        issues.push({
          type: "warning",
          line: lineNum,
          message: `Unpinned base image tag '${image}'. It is best practice to pin specific versions (e.g. node:20-alpine) to avoid unexpected build breaks.`,
        });
      }
    }

    if (!hasFrom && instruction !== "ARG") {
      issues.push({
        type: "error",
        line: lineNum,
        message: `Instruction '${instruction}' appears before the initial FROM command.`,
      });
    }

    if (instruction === "USER") {
      hasUser = true;
    }

    if (instruction === "WORKDIR") {
      hasWorkdir = true;
    }

    if (instruction === "CMD") {
      cmdCount++;
      if (cmdCount > 1) {
        issues.push({
          type: "warning",
          line: lineNum,
          message: "Multiple CMD instructions detected. Only the last CMD will take effect.",
        });
      }
    }

    if (instruction === "ADD") {
      issues.push({
        type: "info",
        line: lineNum,
        message: "Consider using 'COPY' instead of 'ADD' for local files unless extracting a tarball archive.",
      });
    }

    if (instruction === "RUN" && line.includes("sudo")) {
      issues.push({
        type: "warning",
        line: lineNum,
        message: "Avoid using 'sudo' inside container builds. Commands already run as root by default.",
      });
    }
  });

  if (!hasFrom) {
    issues.push({
      type: "error",
      line: 1,
      message: "Missing 'FROM' instruction. Every Dockerfile must specify a base image.",
    });
  }

  if (!hasUser) {
    issues.push({
      type: "warning",
      line: lines.length,
      message: "No 'USER' directive specified. The container will run as root by default, which is a security risk in production.",
    });
  }

  if (!hasWorkdir) {
    issues.push({
      type: "info",
      line: lines.length,
      message: "No 'WORKDIR' specified. Best practice is to define an explicit working directory (e.g. WORKDIR /app).",
    });
  }

  return issues;
}

function lintCompose(content) {
  const issues = [];
  const services = [];
  const exposedPorts = new Map();

  const lines = content.split("\n");
  let inServices = false;
  let currentService = null;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("services:")) {
      inServices = true;
      return;
    }

    if (inServices) {
      // Check service definition (indented by 2 spaces)
      const serviceMatch = rawLine.match(/^ {2}([a-zA-Z0-9_-]+):/);
      if (serviceMatch) {
        currentService = {
          name: serviceMatch[1],
          line: lineNum,
          ports: [],
          image: "",
        };
        services.push(currentService);
      }

      // Check image
      if (currentService && trimmed.startsWith("image:")) {
        currentService.image = trimmed.replace("image:", "").trim();
      }

      // Check port bindings
      const portMatch = trimmed.match(/- ["']?([0-9]+):([0-9]+)["']?/);
      if (portMatch && currentService) {
        const hostPort = portMatch[1];
        currentService.ports.push(`${hostPort}:${portMatch[2]}`);

        if (exposedPorts.has(hostPort)) {
          issues.push({
            type: "error",
            line: lineNum,
            message: `Host port collision: Port ${hostPort} is exposed by both '${exposedPorts.get(hostPort)}' and '${currentService.name}'.`,
          });
        } else {
          exposedPorts.set(hostPort, currentService.name);
        }
      }

      // Check hardcoded passwords
      if (
        trimmed.toUpperCase().includes("PASSWORD") &&
        (trimmed.includes("secret") || trimmed.includes("123456") || trimmed.includes("admin"))
      ) {
        issues.push({
          type: "warning",
          line: lineNum,
          message: "Potential insecure default password hardcoded in compose file. Use an .env file instead.",
        });
      }
    }
  });

  if (!content.includes("services:")) {
    issues.push({
      type: "error",
      line: 1,
      message: "Missing 'services:' root key in Docker Compose file.",
    });
  }

  return { issues, services };
}

export default function DockerValidator() {
  const [mode, setMode] = useState("dockerfile"); // "dockerfile" | "compose"
  const [content, setContent] = useState(DOCKERFILE_TEMPLATES.nextjs);
  const [copied, setCopied] = useState(false);

  const { issues, services } = useMemo(() => {
    if (!content.trim()) return { issues: [], services: [] };
    if (mode === "dockerfile") {
      return { issues: lintDockerfile(content), services: [] };
    } else {
      return lintCompose(content);
    }
  }, [content, mode]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warnCount = issues.filter((i) => i.type === "warning").length;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === "dockerfile") {
      setContent(DOCKERFILE_TEMPLATES.nextjs);
    } else {
      setContent(COMPOSE_TEMPLATES.fullstack);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Docker Compose & Dockerfile Validator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Analyze Dockerfiles and docker-compose.yml files for security issues, host port collisions, and best practices.
            </p>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => handleSwitchMode("dockerfile")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                mode === "dockerfile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Dockerfile
            </button>
            <button
              onClick={() => handleSwitchMode("compose")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                mode === "compose"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              docker-compose.yml
            </button>
          </div>
        </div>

        {/* Templates Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Templates:</span>
            {mode === "dockerfile" ? (
              <>
                <button
                  onClick={() => setContent(DOCKERFILE_TEMPLATES.nextjs)}
                  className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer"
                >
                  Next.js App Router
                </button>
                <button
                  onClick={() => setContent(DOCKERFILE_TEMPLATES.node)}
                  className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer"
                >
                  Node.js API
                </button>
                <button
                  onClick={() => setContent(DOCKERFILE_TEMPLATES.python)}
                  className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer"
                >
                  Python FastAPI
                </button>
              </>
            ) : (
              <button
                onClick={() => setContent(COMPOSE_TEMPLATES.fullstack)}
                className="px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer"
              >
                Web + Postgres + Redis
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                errorCount > 0
                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                  : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
              }`}
            >
              {errorCount} Error{errorCount !== 1 ? "s" : ""}
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                warnCount > 0
                  ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {warnCount} Warning{warnCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Editor & Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {mode === "dockerfile" ? "Dockerfile Code" : "docker-compose.yml"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => setContent("")}
                className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste docker content here..."
            className="w-full flex-1 min-h-[440px] font-mono text-xs p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Diagnostics & Structure (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Services Overview (Compose only) */}
          {mode === "compose" && services.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                Detected Services ({services.length})
              </h3>
              <div className="space-y-2">
                {services.map((svc) => (
                  <div
                    key={svc.name}
                    className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{svc.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        line {svc.line}
                      </span>
                    </div>
                    {svc.image && (
                      <div className="text-gray-500 dark:text-gray-400 text-[11px] mt-1 font-mono">
                        image: {svc.image}
                      </div>
                    )}
                    {svc.ports.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {svc.ports.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-mono text-[10px]"
                          >
                            ports: {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linter Issues List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
              Analysis Results ({issues.length})
            </h3>

            {issues.length === 0 ? (
              <div className="text-center py-8 text-green-600 dark:text-green-400">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="font-bold text-sm">No issues detected!</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your configuration follows standard container guidelines.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                {issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs ${
                      iss.type === "error"
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                        : iss.type === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="uppercase text-[10px] tracking-wider">
                        {iss.type === "error" ? "Error" : iss.type === "warning" ? "Warning" : "Best Practice"}
                      </span>
                      <span className="font-mono text-[10px] opacity-75">
                        Line {iss.line}
                      </span>
                    </div>
                    <p className="leading-relaxed">{iss.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
