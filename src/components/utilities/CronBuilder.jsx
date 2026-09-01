"use client";

import { useState, useMemo } from "react";

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every hour at minute 0", cron: "0 * * * *" },
  { label: "Every 2 hours", cron: "0 */2 * * *" },
  { label: "Every day at midnight (00:00)", cron: "0 0 * * *" },
  { label: "Every day at 9:00 AM", cron: "0 9 * * *" },
  { label: "Weekdays at 9:00 AM (Mon-Fri)", cron: "0 9 * * 1-5" },
  { label: "Every Sunday at midnight", cron: "0 0 * * 0" },
  { label: "First day of every month at midnight", cron: "0 0 1 * *" },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function explainCron(cronStr) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return "Invalid cron expression: Standard cron requires exactly 5 fields (minute hour day month day-of-week).";
  }

  const [min, hour, dom, month, dow] = parts;

  // Build natural English phrase
  let desc = "";

  // Minutes
  if (min === "*") {
    desc += "Every minute";
  } else if (min.startsWith("*/")) {
    desc += `Every ${min.slice(2)} minutes`;
  } else {
    desc += `At minute ${min}`;
  }

  // Hours
  if (hour === "*") {
    if (min !== "*") desc += ", every hour";
  } else if (hour.startsWith("*/")) {
    desc += `, every ${hour.slice(2)} hours`;
  } else if (hour.includes("-")) {
    desc += `, between hours ${hour}`;
  } else {
    desc += `, at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  // Day of Month
  if (dom !== "*") {
    if (dom.startsWith("*/")) {
      desc += `, every ${dom.slice(2)} days`;
    } else {
      desc += `, on day ${dom} of the month`;
    }
  }

  // Month
  if (month !== "*") {
    if (month.startsWith("*/")) {
      desc += `, every ${month.slice(2)} months`;
    } else {
      const monthNames = month
        .split(",")
        .map((m) => {
          const idx = parseInt(m, 10) - 1;
          return MONTHS[idx] || m;
        })
        .join(", ");
      desc += `, in ${monthNames}`;
    }
  }

  // Day of Week
  if (dow !== "*") {
    if (dow === "1-5") {
      desc += ", Monday through Friday";
    } else if (dow === "0,6" || dow === "6,0") {
      desc += ", on weekends (Saturday and Sunday)";
    } else {
      const days = dow
        .split(",")
        .map((d) => DAYS_OF_WEEK[parseInt(d, 10) % 7] || d)
        .join(", ");
      desc += `, on ${days}`;
    }
  }

  return desc + ".";
}

function fieldMatches(pattern, value, min, max) {
  if (pattern === "*") return true;

  if (pattern.startsWith("*/")) {
    const step = parseInt(pattern.slice(2), 10);
    return step > 0 && value % step === 0;
  }

  if (pattern.includes(",")) {
    const list = pattern.split(",").map((p) => parseInt(p, 10));
    return list.includes(value);
  }

  if (pattern.includes("-")) {
    const [start, end] = pattern.split("-").map((p) => parseInt(p, 10));
    return value >= start && value <= end;
  }

  const num = parseInt(pattern, 10);
  return num === value;
}

function getNextExecutions(cronStr, count = 5) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minP, hourP, domP, monthP, dowP] = parts;
  const dates = [];
  const curr = new Date();
  curr.setSeconds(0);
  curr.setMilliseconds(0);
  curr.setMinutes(curr.getMinutes() + 1);

  // Maximum iterations to avoid any loop lock
  let iterations = 0;
  const maxIterations = 50000;

  while (dates.length < count && iterations < maxIterations) {
    iterations++;

    const m = curr.getMinutes();
    const h = curr.getHours();
    const dom = curr.getDate();
    const mon = curr.getMonth() + 1;
    const dow = curr.getDay();

    if (
      fieldMatches(minP, m, 0, 59) &&
      fieldMatches(hourP, h, 0, 23) &&
      fieldMatches(domP, dom, 1, 31) &&
      fieldMatches(monthP, mon, 1, 12) &&
      fieldMatches(dowP, dow, 0, 6)
    ) {
      dates.push(new Date(curr));
    }

    curr.setMinutes(curr.getMinutes() + 1);
  }

  return dates;
}

export default function CronBuilder() {
  const [cron, setCron] = useState("*/15 * * * *");
  const [copied, setCopied] = useState(false);

  const parts = useMemo(() => {
    const p = cron.trim().split(/\s+/);
    return {
      min: p[0] || "*",
      hour: p[1] || "*",
      dom: p[2] || "*",
      month: p[3] || "*",
      dow: p[4] || "*",
    };
  }, [cron]);

  const explanation = useMemo(() => explainCron(cron), [cron]);
  const nextRuns = useMemo(() => getNextExecutions(cron, 5), [cron]);

  const updatePart = (index, value) => {
    const p = cron.trim().split(/\s+/);
    while (p.length < 5) p.push("*");
    p[index] = value;
    setCron(p.join(" "));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Cron Expression Builder & Explainer</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Build, parse, and translate standard 5-part cron schedules into plain English with live upcoming execution preview.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Cron</span>
              </>
            )}
          </button>
        </div>

        {/* Live Expression Input & Human Translation Banner */}
        <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Cron Expression
              </span>
              <input
                type="text"
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                placeholder="* * * * *"
                className="w-full mt-1 px-4 py-2.5 font-mono text-xl font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none tracking-widest text-center sm:text-left"
              />
            </div>

            <div className="w-full sm:w-auto flex-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Human-Readable Meaning
              </span>
              <div className="mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{explanation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2.5">
            Quick Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setCron(p.cron)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  cron === p.cron
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Field-by-Field Interactive Builder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Minute */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            1. Minute
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">0 - 59</p>
          <input
            type="text"
            value={parts.min}
            onChange={(e) => updatePart(0, e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="mt-3 flex flex-col gap-1.5">
            <button
              onClick={() => updatePart(0, "*")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every minute (*)
            </button>
            <button
              onClick={() => updatePart(0, "*/5")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every 5 mins (*/5)
            </button>
            <button
              onClick={() => updatePart(0, "*/15")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every 15 mins (*/15)
            </button>
            <button
              onClick={() => updatePart(0, "0")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              At minute 0 (0)
            </button>
          </div>
        </div>

        {/* Hour */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            2. Hour
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">0 - 23 (24hr)</p>
          <input
            type="text"
            value={parts.hour}
            onChange={(e) => updatePart(1, e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="mt-3 flex flex-col gap-1.5">
            <button
              onClick={() => updatePart(1, "*")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every hour (*)
            </button>
            <button
              onClick={() => updatePart(1, "0")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Midnight (0)
            </button>
            <button
              onClick={() => updatePart(1, "9")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              9:00 AM (9)
            </button>
            <button
              onClick={() => updatePart(1, "9-17")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              9 AM - 5 PM (9-17)
            </button>
          </div>
        </div>

        {/* Day of Month */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            3. Day of Month
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">1 - 31</p>
          <input
            type="text"
            value={parts.dom}
            onChange={(e) => updatePart(2, e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="mt-3 flex flex-col gap-1.5">
            <button
              onClick={() => updatePart(2, "*")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every day (*)
            </button>
            <button
              onClick={() => updatePart(2, "1")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              1st of month (1)
            </button>
            <button
              onClick={() => updatePart(2, "15")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              15th of month (15)
            </button>
            <button
              onClick={() => updatePart(2, "1,15")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Bi-weekly (1,15)
            </button>
          </div>
        </div>

        {/* Month */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            4. Month
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">1 - 12 (Jan - Dec)</p>
          <input
            type="text"
            value={parts.month}
            onChange={(e) => updatePart(3, e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="mt-3 flex flex-col gap-1.5">
            <button
              onClick={() => updatePart(3, "*")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every month (*)
            </button>
            <button
              onClick={() => updatePart(3, "*/3")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Quarterly (*/3)
            </button>
            <button
              onClick={() => updatePart(3, "1")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              January only (1)
            </button>
            <button
              onClick={() => updatePart(3, "6,12")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Semi-annually (6,12)
            </button>
          </div>
        </div>

        {/* Day of Week */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            5. Day of Week
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">0 - 6 (Sun - Sat)</p>
          <input
            type="text"
            value={parts.dow}
            onChange={(e) => updatePart(4, e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="mt-3 flex flex-col gap-1.5">
            <button
              onClick={() => updatePart(4, "*")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Every day (*)
            </button>
            <button
              onClick={() => updatePart(4, "1-5")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Weekdays (1-5)
            </button>
            <button
              onClick={() => updatePart(4, "0,6")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Weekends (0,6)
            </button>
            <button
              onClick={() => updatePart(4, "1")}
              className="text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Mondays only (1)
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Run Times Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>📅 Next 5 Scheduled Executions</span>
          <span className="text-xs text-gray-500 font-normal">
            (Calculated in your local time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone})
          </span>
        </h3>

        {nextRuns.length > 0 ? (
          <div className="space-y-2">
            {nextRuns.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-semibold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Unable to calculate upcoming run times for the current expression.
          </p>
        )}
      </div>
    </div>
  );
}
