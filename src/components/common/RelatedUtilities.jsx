"use client";

import Link from "next/link";
import { utilities } from "../../data/utilities";

export default function RelatedUtilities({ currentUtilityId, category }) {
  // Find up to 4 utilities from the same category
  const sameCategory = utilities.filter(
    (u) => u.category === category && u.id !== currentUtilityId
  );

  let related = sameCategory.slice(0, 4);
  if (related.length < 4) {
    const others = utilities.filter(
      (u) => u.id !== currentUtilityId && !related.some((r) => r.id === u.id)
    );
    related = [...related, ...others.slice(0, 4 - related.length)];
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-10 sm:mt-16 pt-6 sm:pt-10 border-t border-gray-200 dark:border-gray-800 space-y-3 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Related Tools in {category}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Complementary utilities to accelerate your workflow.
          </p>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-block mt-1 sm:mt-0"
        >
          View all 71 tools →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {related.map((tool) => (
          <Link
            key={tool.id}
            href={`/utility/${tool.id}`}
            className="p-3.5 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                  {tool.category}
                </span>
                <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-xs">
                  →
                </span>
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
