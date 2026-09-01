"use client";

import { useState } from "react";

const RECIPES = [
  {
    id: "undo-soft",
    title: "Undo last commit (keep changes staged)",
    category: "Undo & Reset",
    desc: "Undoes the commit but leaves all your file modifications staged and ready to commit again.",
    risk: "safe",
    params: [],
    generate: () => `git reset --soft HEAD~1`,
  },
  {
    id: "undo-unstaged",
    title: "Undo last commit (keep changes unstaged)",
    category: "Undo & Reset",
    desc: "Undoes the commit and unstages the modified files so you can edit them locally.",
    risk: "safe",
    params: [],
    generate: () => `git reset HEAD~1`,
  },
  {
    id: "undo-hard",
    title: "Completely discard last commit and all changes",
    category: "Undo & Reset",
    desc: "Permanently deletes the last commit and discards all changes. Cannot be undone without reflog.",
    risk: "danger",
    params: [],
    generate: () => `git reset --hard HEAD~1`,
  },
  {
    id: "discard-local",
    title: "Discard all uncommitted local modifications",
    category: "Undo & Reset",
    desc: "Reverts all modified tracked files in the current directory back to the last commit.",
    risk: "danger",
    params: [],
    generate: () => `git restore .\n# Or in older Git versions:\n# git checkout -- .`,
  },
  {
    id: "revert-commit",
    title: "Revert a commit already pushed to remote",
    category: "Undo & Reset",
    desc: "Creates a new inverse commit that cancels out changes from a previous commit without rewriting history.",
    risk: "safe",
    params: [{ key: "hash", label: "Commit SHA / Hash", default: "abc1234" }],
    generate: (p) => `git revert ${p.hash || "abc1234"}`,
  },
  {
    id: "amend-message",
    title: "Change the message of your last commit",
    category: "Commit Editing",
    desc: "Rewrites the most recent commit message without changing any files.",
    risk: "warning",
    params: [{ key: "msg", label: "New Commit Message", default: "feat: add user authentication" }],
    generate: (p) => `git commit --amend -m "${p.msg || "feat: updated message"}"`,
  },
  {
    id: "amend-files",
    title: "Add forgotten files to the last commit",
    category: "Commit Editing",
    desc: "Stages forgotten files and merges them into the previous commit without changing the message.",
    risk: "warning",
    params: [{ key: "file", label: "File path(s) to add", default: "src/utils.js" }],
    generate: (p) => `git add ${p.file || "."}\ngit commit --amend --no-edit`,
  },
  {
    id: "squash-commits",
    title: "Squash / Combine last N commits into one",
    category: "Commit Editing",
    desc: "Starts an interactive rebase allowing you to combine multiple small commits into a single clean commit.",
    risk: "warning",
    params: [{ key: "count", label: "Number of commits to squash", default: "3" }],
    generate: (p) => `# 1. Start interactive rebase:\ngit rebase -i HEAD~${p.count || "3"}\n\n# 2. In the text editor, keep the first commit as 'pick'\n# and change subsequent commits from 'pick' to 'squash' (or 's')\n# 3. Save and close editor to finalize.`,
  },
  {
    id: "rename-branch",
    title: "Rename current local branch and sync to remote",
    category: "Branches",
    desc: "Renames the branch locally, pushes the new name to origin, and cleans up the old remote branch.",
    risk: "safe",
    params: [
      { key: "oldName", label: "Old Branch Name", default: "feature/old-name" },
      { key: "newName", label: "New Branch Name", default: "feature/new-name" },
    ],
    generate: (p) => `git branch -m ${p.newName || "new-branch"}\ngit push origin -u ${p.newName || "new-branch"}\ngit push origin --delete ${p.oldName || "old-branch"}`,
  },
  {
    id: "cherry-pick",
    title: "Cherry-pick a commit from another branch",
    category: "Branches",
    desc: "Applies a specific commit from a feature branch directly onto your current active branch.",
    risk: "safe",
    params: [{ key: "hash", label: "Commit SHA to apply", default: "7f8b9a1" }],
    generate: (p) => `git cherry-pick ${p.hash || "7f8b9a1"}`,
  },
  {
    id: "recover-reflog",
    title: "Recover a deleted branch or lost commit",
    category: "Recovery & Stash",
    desc: "Finds the commit hash of deleted work in Git's reference log and recreates a branch pointing to it.",
    risk: "safe",
    params: [{ key: "branch", label: "New branch name to restore into", default: "recovered-branch" }],
    generate: (p) => `# 1. Look up recent commit history:\ngit reflog\n\n# 2. Identify the commit hash (e.g. HEAD@{2} or abc1234)\n# 3. Recreate the branch from that commit:\ngit checkout -b ${p.branch || "recovered-work"} <commit-sha>`,
  },
  {
    id: "stash-work",
    title: "Stash work with a custom descriptive message",
    category: "Recovery & Stash",
    desc: "Saves your uncommitted changes into the stash stack with a clear name, then restores them later.",
    risk: "safe",
    params: [{ key: "name", label: "Stash Description", default: "WIP: navbar styling" }],
    generate: (p) => `# 1. Save work to stash:\ngit stash push -m "${p.name || "work in progress"}"\n\n# 2. When ready to resume work later:\ngit stash pop`,
  },
];

const CATEGORIES = ["All", "Undo & Reset", "Commit Editing", "Branches", "Recovery & Stash"];

export default function GitHelper() {
  const [selectedId, setSelectedId] = useState("undo-soft");
  const [paramValues, setParamValues] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState(false);

  const selectedRecipe = RECIPES.find((r) => r.id === selectedId) || RECIPES[0];

  const currentParams = {};
  selectedRecipe.params.forEach((p) => {
    currentParams[p.key] = paramValues[p.key] ?? p.default;
  });

  const generatedCommand = selectedRecipe.generate(currentParams);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRecipes =
    activeCategory === "All"
      ? RECIPES
      : RECIPES.filter((r) => r.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Git Command & Rebase Helper</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Interactive recipe builder for complex Git commands: undoing commits, interactive rebases, reflog recovery, and squashing.
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recipes List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-3">
            Select Operation ({filteredRecipes.length})
          </span>

          <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
            {filteredRecipes.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedId(r.id);
                  setParamValues({});
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedId === r.id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 shadow-sm"
                    : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {r.title}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      r.risk === "danger"
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                        : r.risk === "warning"
                        ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                        : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                    }`}
                  >
                    {r.risk}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {r.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Parameters & Command Generator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {selectedRecipe.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {selectedRecipe.desc}
                </p>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                  selectedRecipe.risk === "danger"
                    ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                    : selectedRecipe.risk === "warning"
                    ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                    : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                }`}
              >
                {selectedRecipe.risk} operation
              </span>
            </div>

            {/* Custom parameters */}
            {selectedRecipe.params.length > 0 && (
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  Command Parameters
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {selectedRecipe.params.map((p) => (
                    <div key={p.key}>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {p.label}
                      </label>
                      <input
                        type="text"
                        value={paramValues[p.key] ?? p.default}
                        onChange={(e) =>
                          setParamValues({ ...paramValues, [p.key]: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Command Preview Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Terminal Command
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  {copied ? (
                    <span>Copied!</span>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-lg overflow-auto leading-relaxed border border-gray-800">
                {generatedCommand}
              </pre>
            </div>

            {/* Risk Warnings */}
            {selectedRecipe.risk === "danger" && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>Destructive Action:</strong> This command discards uncommitted work or rewrites history. Make sure you don&apos;t have unsaved modifications before executing.
                </span>
              </div>
            )}

            {selectedRecipe.risk === "warning" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>History Rewrite:</strong> If you have already pushed these commits to GitHub/GitLab, you will need to force-push (<code className="font-mono">git push --force-with-lease</code>) after running this command.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
