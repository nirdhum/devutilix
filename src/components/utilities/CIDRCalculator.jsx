"use client";

import { useState, useMemo } from "react";

const PRESETS = [
  { label: "Home LAN (/24)", ip: "192.168.1.0", prefix: 24, desc: "Standard 254 host subnet" },
  { label: "AWS VPC (/16)", ip: "10.0.0.0", prefix: 16, desc: "Standard cloud VPC (65,534 hosts)" },
  { label: "Docker Bridge (/16)", ip: "172.17.0.0", prefix: 16, desc: "Default container network" },
  { label: "Small Office (/23)", ip: "192.168.0.0", prefix: 23, desc: "Dual subnet (510 hosts)" },
  { label: "Point-to-Point (/30)", ip: "10.0.0.0", prefix: 30, desc: "Router-to-router link (2 hosts)" },
  { label: "Single Host (/32)", ip: "1.1.1.1", prefix: 32, desc: "Host-specific route (1 IP)" },
];

function ipToLong(ip) {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
}

function longToIp(long) {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join(".");
}

function longToBinary(long) {
  return [
    ((long >>> 24) & 255).toString(2).padStart(8, "0"),
    ((long >>> 16) & 255).toString(2).padStart(8, "0"),
    ((long >>> 8) & 255).toString(2).padStart(8, "0"),
    (long & 255).toString(2).padStart(8, "0"),
  ].join(".");
}

function calculateCIDR(ipStr, prefix) {
  const cleanIp = ipStr.trim();
  const parts = cleanIp.split(".");
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p === "" || Number(p) < 0 || Number(p) > 255)) {
    return { error: "Please enter a valid IPv4 address (e.g. 192.168.1.0)" };
  }

  const p = Number(prefix);
  if (isNaN(p) || p < 0 || p > 32) {
    return { error: "Prefix must be a number between 0 and 32" };
  }

  const ipLong = ipToLong(cleanIp);
  const maskLong = p === 0 ? 0 : ((0xffffffff << (32 - p)) >>> 0);
  const wildcardLong = (~maskLong) >>> 0;
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalIps = Math.pow(2, 32 - p);
  let usableHosts = 0;
  let firstHost = "";
  let lastHost = "";

  if (p === 32) {
    usableHosts = 1;
    firstHost = longToIp(networkLong);
    lastHost = longToIp(networkLong);
  } else if (p === 31) {
    usableHosts = 2; // RFC 3021
    firstHost = longToIp(networkLong);
    lastHost = longToIp(broadcastLong);
  } else {
    usableHosts = Math.max(0, totalIps - 2);
    firstHost = longToIp((networkLong + 1) >>> 0);
    lastHost = longToIp((broadcastLong - 1) >>> 0);
  }

  // Determine Class & Type
  const firstOctet = Number(parts[0]);
  let ipClass = "Class A";
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = "Class B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "Class C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "Class D (Multicast)";
  else if (firstOctet >= 240) ipClass = "Class E (Experimental)";

  let ipType = "Public";
  if (firstOctet === 10) ipType = "Private (RFC 1918)";
  else if (firstOctet === 172 && Number(parts[1]) >= 16 && Number(parts[1]) <= 31) ipType = "Private (RFC 1918)";
  else if (firstOctet === 192 && Number(parts[1]) === 168) ipType = "Private (RFC 1918)";
  else if (firstOctet === 127) ipType = "Loopback";
  else if (firstOctet === 169 && Number(parts[1]) === 254) ipType = "Link-Local";

  return {
    ip: cleanIp,
    prefix: p,
    cidrNotation: `${longToIp(networkLong)}/${p}`,
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    netmask: longToIp(maskLong),
    wildcardMask: longToIp(wildcardLong),
    firstHost,
    lastHost,
    usableHosts: usableHosts.toLocaleString(),
    totalIps: totalIps.toLocaleString(),
    ipClass,
    ipType,
    ipBinary: longToBinary(ipLong),
    maskBinary: longToBinary(maskLong),
  };
}

export default function CIDRCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState(24);
  const [copiedKey, setCopiedKey] = useState("");

  const data = useMemo(() => calculateCIDR(ip, prefix), [ip, prefix]);

  const handleCopy = (val, key) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>CIDR & Subnet Calculator</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Calculate network ranges, usable host IPs, broadcast addresses, wildcard masks, and subnets in real time.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5">
                IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.0"
                className="w-full px-3.5 py-2 text-base font-mono font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5">
                Prefix (/{prefix})
              </label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from({ length: 33 }, (_, i) => 32 - i).map((p) => (
                  <option key={p} value={p}>
                    /{p} ({Math.pow(2, 32 - p).toLocaleString()} IPs)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs w-full text-center">
                <span className="text-gray-400 block text-[10px] uppercase">Designation</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {!data.error ? `${data.ipClass} • ${data.ipType}` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
            Common Network Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setIp(p.ip);
                  setPrefix(p.prefix);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  ip === p.ip && prefix === p.prefix
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

      {data.error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {data.error}
        </div>
      ) : (
        <>
          {/* Main Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">
                Usable Hosts
              </span>
              <span className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                {data.usableHosts}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">
                Total Addresses
              </span>
              <span className="font-mono text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
                {data.totalIps}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">
                Subnet Mask
              </span>
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white mt-2 block truncate">
                {data.netmask}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">
                Wildcard Mask
              </span>
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white mt-2 block truncate">
                {data.wildcardMask}
              </span>
            </div>
          </div>

          {/* Subnet Details Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Subnet Network Information
              </h3>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold">
                {data.cidrNotation}
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs sm:text-sm">
              {[
                { label: "CIDR Route", val: data.cidrNotation, key: "cidr" },
                { label: "Network Address", val: data.networkAddress, key: "net" },
                { label: "Broadcast Address", val: data.broadcastAddress, key: "bcast" },
                { label: "First Usable Host", val: data.firstHost, key: "first" },
                { label: "Last Usable Host", val: data.lastHost, key: "last" },
                { label: "Subnet Mask", val: data.netmask, key: "mask" },
                { label: "Wildcard Mask", val: data.wildcardMask, key: "wild" },
              ].map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-600 dark:text-gray-400">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{row.val}</span>
                    <button
                      onClick={() => handleCopy(row.val, row.key)}
                      className="text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                    >
                      {copiedKey === row.key ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Binary Representation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Binary Representation
            </h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-gray-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-gray-400">IP Binary:</span>
                <span className="text-green-400">{data.ipBinary}</span>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-gray-400">Mask Binary:</span>
                <span className="text-blue-400">{data.maskBinary}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
