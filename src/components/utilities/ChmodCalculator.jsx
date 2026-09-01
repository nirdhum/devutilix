"use client";

import { useState } from "react";

const PRESETS = [
  { label: "Standard File (644)", octal: "644", desc: "Owner can read/write, others can read" },
  { label: "Executable Script (755)", octal: "755", desc: "Owner can read/write/exec, others can read/exec" },
  { label: "Private SSH Key (600)", octal: "600", desc: "Owner only can read/write, no group/other access" },
  { label: "Read-Only File (444)", octal: "444", desc: "Everyone can only read the file" },
  { label: "Web Directory (755)", octal: "755", desc: "Standard directory permissions for web servers" },
  { label: "Shared Write Dir (775)", octal: "775", desc: "Owner and group can modify, others can only read" },
  { label: "Full Permissions (777)", octal: "777", desc: "Read, write, and execute for everyone (insecure)" },
];

export default function ChmodCalculator() {
  const [permissions, setPermissions] = useState({
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
  });

  const [special, setSpecial] = useState({
    suid: false,
    sgid: false,
    sticky: false,
  });

  const [filename, setFilename] = useState("myfile.sh");
  const [copied, setCopied] = useState("");

  // Calculate octal numbers
  const calcOctalDigit = (perm) => {
    let sum = 0;
    if (perm.read) sum += 4;
    if (perm.write) sum += 2;
    if (perm.execute) sum += 1;
    return sum;
  };

  const ownerOctal = calcOctalDigit(permissions.owner);
  const groupOctal = calcOctalDigit(permissions.group);
  const othersOctal = calcOctalDigit(permissions.others);

  let specialOctal = 0;
  if (special.suid) specialOctal += 4;
  if (special.sgid) specialOctal += 2;
  if (special.sticky) specialOctal += 1;

  const octalString = `${specialOctal > 0 ? specialOctal : ""}${ownerOctal}${groupOctal}${othersOctal}`;
  const standardOctal = `${ownerOctal}${groupOctal}${othersOctal}`;

  // Calculate symbolic notation
  const calcSymbolic = () => {
    let s = "-";
    // Owner
    s += permissions.owner.read ? "r" : "-";
    s += permissions.owner.write ? "w" : "-";
    if (special.suid) {
      s += permissions.owner.execute ? "s" : "S";
    } else {
      s += permissions.owner.execute ? "x" : "-";
    }

    // Group
    s += permissions.group.read ? "r" : "-";
    s += permissions.group.write ? "w" : "-";
    if (special.sgid) {
      s += permissions.group.execute ? "s" : "S";
    } else {
      s += permissions.group.execute ? "x" : "-";
    }

    // Others
    s += permissions.others.read ? "r" : "-";
    s += permissions.others.write ? "w" : "-";
    if (special.sticky) {
      s += permissions.others.execute ? "t" : "T";
    } else {
      s += permissions.others.execute ? "x" : "-";
    }

    return s;
  };

  const symbolicString = calcSymbolic();

  const handleOctalInput = (val) => {
    const clean = val.replace(/[^0-7]/g, "").slice(0, 4);
    if (!clean) return;

    let o = clean;
    let spec = 0;
    if (clean.length === 4) {
      spec = parseInt(clean[0], 10);
      o = clean.slice(1);
    }

    if (o.length === 3) {
      const p1 = parseInt(o[0], 10);
      const p2 = parseInt(o[1], 10);
      const p3 = parseInt(o[2], 10);

      setPermissions({
        owner: {
          read: (p1 & 4) === 4,
          write: (p1 & 2) === 2,
          execute: (p1 & 1) === 1,
        },
        group: {
          read: (p2 & 4) === 4,
          write: (p2 & 2) === 2,
          execute: (p2 & 1) === 1,
        },
        others: {
          read: (p3 & 4) === 4,
          write: (p3 & 2) === 2,
          execute: (p3 & 1) === 1,
        },
      });

      setSpecial({
        suid: (spec & 4) === 4,
        sgid: (spec & 2) === 2,
        sticky: (spec & 1) === 1,
      });
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Unix Permissions (chmod) Calculator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visual permission matrix calculator with octal digits, symbolic flags, and terminal command generation.
            </p>
          </div>
        </div>

        {/* Results Banner */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Octal Notation
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono text-3xl font-bold text-blue-600 dark:text-blue-400">
                {octalString}
              </span>
              <button
                onClick={() => copyToClipboard(octalString, "octal")}
                className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                title="Copy octal"
              >
                {copied === "octal" ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Symbolic Notation
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {symbolicString}
              </span>
              <button
                onClick={() => copyToClipboard(symbolicString, "symbolic")}
                className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                title="Copy symbolic"
              >
                {copied === "symbolic" ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Quick Input
            </span>
            <input
              type="text"
              value={octalString}
              onChange={(e) => handleOctalInput(e.target.value)}
              placeholder="e.g. 755"
              className="mt-1 w-24 text-center font-mono text-lg font-bold bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Presets List */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2.5">
            Common Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleOctalInput(p.octal)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  standardOctal === p.octal
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Permission Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Owner */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Owner (User)</h3>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded">
              Digit: {ownerOctal}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { key: "read", label: "Read (r)", val: 4 },
              { key: "write", label: "Write (w)", val: 2 },
              { key: "execute", label: "Execute (x)", val: 1 },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.owner[item.key]}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        owner: { ...permissions.owner, [item.key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
                </div>
                <span className="text-xs font-mono text-gray-400">+{item.val}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Group */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Group</h3>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded">
              Digit: {groupOctal}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { key: "read", label: "Read (r)", val: 4 },
              { key: "write", label: "Write (w)", val: 2 },
              { key: "execute", label: "Execute (x)", val: 1 },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.group[item.key]}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        group: { ...permissions.group, [item.key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
                </div>
                <span className="text-xs font-mono text-gray-400">+{item.val}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Others */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Others (Public)</h3>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded">
              Digit: {othersOctal}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { key: "read", label: "Read (r)", val: 4 },
              { key: "write", label: "Write (w)", val: 2 },
              { key: "execute", label: "Execute (x)", val: 1 },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.others[item.key]}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        others: { ...permissions.others, [item.key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
                </div>
                <span className="text-xs font-mono text-gray-400">+{item.val}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Special Flags & Terminal Commands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Special Flags */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Special Flags</h3>
          <div className="space-y-2.5">
            {[
              { key: "suid", label: "SetUID (4000)", desc: "Runs with privileges of file owner" },
              { key: "sgid", label: "SetGID (2000)", desc: "Runs with privileges of file group" },
              { key: "sticky", label: "Sticky Bit (1000)", desc: "Only file owner or root can delete" },
            ].map((flag) => (
              <label
                key={flag.key}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={special[flag.key]}
                  onChange={(e) => setSpecial({ ...special, [flag.key]: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">{flag.label}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{flag.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Terminal Commands */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Terminal Commands</h3>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="filename"
                className="w-32 px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              {/* File Command */}
              <div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                <code className="text-xs font-mono text-green-400">
                  chmod {octalString} {filename}
                </code>
                <button
                  onClick={() => copyToClipboard(`chmod ${octalString} ${filename}`, "cmd1")}
                  className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded cursor-pointer transition-colors"
                >
                  {copied === "cmd1" ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Recursive Directory Command */}
              <div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                <code className="text-xs font-mono text-green-400">
                  chmod -R {octalString} {filename.replace(/\.[^/.]+$/, "")}/
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `chmod -R ${octalString} ${filename.replace(/\.[^/.]+$/, "")}/`,
                      "cmd2"
                    )
                  }
                  className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded cursor-pointer transition-colors"
                >
                  {copied === "cmd2" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Tip:</strong> Standard secure file permissions are <span className="font-mono">644</span> for regular files and <span className="font-mono">755</span> for folders and scripts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
