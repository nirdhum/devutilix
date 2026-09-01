"use client";

import { useState, useMemo } from "react";

export default function SystemdGenerator() {
  const [serviceName, setServiceName] = useState("myapp");
  const [description, setDescription] = useState("Production Web Application");
  const [user, setUser] = useState("ubuntu");
  const [group, setGroup] = useState("ubuntu");
  const [workingDir, setWorkingDir] = useState("/var/www/myapp");
  const [execStart, setExecStart] = useState("/usr/bin/npm start");
  const [restart, setRestart] = useState("always");
  const [restartSec, setRestartSec] = useState("5s");
  const [envVars, setEnvVars] = useState("NODE_ENV=production\nPORT=3000");
  const [envFile, setEnvFile] = useState("/var/www/myapp/.env");
  const [copied, setCopied] = useState(false);

  const unitContent = useMemo(() => {
    const cleanName = serviceName.trim().replace(/\.service$/, "") || "myapp";
    const envLines = envVars
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => `Environment="${l}"`)
      .join("\n");

    let conf = `[Unit]
Description=${description || cleanName}
After=network.target

[Service]
Type=simple
User=${user || "ubuntu"}
Group=${group || "ubuntu"}
WorkingDirectory=${workingDir || "/var/www/myapp"}
ExecStart=${execStart || "/usr/bin/npm start"}
Restart=${restart}
RestartSec=${restartSec || "5s"}
`;

    if (envFile.trim()) {
      conf += `EnvironmentFile=${envFile.trim()}\n`;
    }

    if (envLines) {
      conf += `${envLines}\n`;
    }

    conf += `StandardOutput=journal
StandardError=journal
SyslogIdentifier=${cleanName}

[Install]
WantedBy=multi-user.target
`;
    return conf;
  }, [
    serviceName,
    description,
    user,
    group,
    workingDir,
    execStart,
    restart,
    restartSec,
    envVars,
    envFile,
  ]);

  const cleanName = serviceName.trim().replace(/\.service$/, "") || "myapp";

  const handleCopy = () => {
    navigator.clipboard.writeText(unitContent);
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
              <span>Systemd Service Unit Generator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate robust Linux systemd .service configuration files and service management commands.
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
                <span>Copy Unit File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
            Service Settings
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="myapp"
                className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Restart Policy
              </label>
              <select
                value={restart}
                onChange={(e) => setRestart(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="always">always</option>
                <option value="on-failure">on-failure</option>
                <option value="unless-stopped">unless-stopped</option>
                <option value="no">no</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Production Web Application"
              className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Linux User
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="ubuntu"
                className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Linux Group
              </label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="ubuntu"
                className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Working Directory
            </label>
            <input
              type="text"
              value={workingDir}
              onChange={(e) => setWorkingDir(e.target.value)}
              placeholder="/var/www/myapp"
              className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              ExecStart Command
            </label>
            <input
              type="text"
              value={execStart}
              onChange={(e) => setExecStart(e.target.value)}
              placeholder="/usr/bin/npm start"
              className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Environment File (Optional)
            </label>
            <input
              type="text"
              value={envFile}
              onChange={(e) => setEnvFile(e.target.value)}
              placeholder="/var/www/myapp/.env"
              className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Inline Environment Variables
            </label>
            <textarea
              rows={2}
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              placeholder="KEY=VALUE"
              className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Generated Unit File & Management Commands (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                /etc/systemd/system/{cleanName}.service
              </span>
            </div>

            <pre className="w-full min-h-[320px] font-mono text-xs p-3 bg-gray-900 text-gray-100 border border-gray-800 rounded-lg overflow-auto leading-relaxed">
              {unitContent}
            </pre>
          </div>

          {/* Management Commands */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm text-xs space-y-2">
            <span className="font-bold text-gray-900 dark:text-white block uppercase tracking-wider text-[11px]">
              Linux Terminal Management Commands:
            </span>
            <div className="space-y-1.5 font-mono text-gray-700 dark:text-gray-300">
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                sudo cp {cleanName}.service /etc/systemd/system/
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                sudo systemctl daemon-reload
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-green-600 dark:text-green-400 font-bold">
                sudo systemctl enable --now {cleanName}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                sudo systemctl status {cleanName}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400">
                sudo journalctl -u {cleanName} -f
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
