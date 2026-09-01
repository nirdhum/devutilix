"use client";

import { useState, useMemo } from "react";

const SAMPLE_TEXT = `Modern web development has evolved rapidly over the past decade. Building high-performance, accessible applications requires careful architectural consideration. Client-side utilities must operate with minimal latency while guaranteeing absolute user privacy. When data is computed locally without transmitting sensitive payloads across third-party networks, users enjoy both speed and peace of mind.`;

function countSyllables(word) {
  let w = word.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/, "").replace(/^y/, "");
  const matches = w.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export default function ReadabilityAnalyzer() {
  const [text, setText] = useState(SAMPLE_TEXT);

  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        characters: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        syllables: 0,
        readingTime: "0 min",
        speakingTime: "0 min",
        fleschEase: 0,
        fleschGrade: 0,
        colemanLiau: 0,
        ari: 0,
        longestWords: [],
      };
    }

    const words = raw.match(/\b[A-Za-z0-9_-]+\b/g) || [];
    const wordCount = words.length;
    const characters = raw.length;
    const charsNoSpaces = raw.replace(/\s+/g, "").length;
    const sentences = (raw.match(/[.!?]+(?:\s+|$)/g) || []).length || 1;
    const paragraphs = raw.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;

    let syllableCount = 0;
    for (const w of words) {
      syllableCount += countSyllables(w);
    }

    // Formulas
    // 1. Flesch Reading Ease
    const ease =
      wordCount > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                206.835 -
                  1.015 * (wordCount / sentences) -
                  84.6 * (syllableCount / wordCount)
              )
            )
          )
        : 0;

    // 2. Flesch-Kincaid Grade Level
    const fkGrade =
      wordCount > 0
        ? Math.max(
            1,
            Math.round(
              (0.39 * (wordCount / sentences) +
                11.8 * (syllableCount / wordCount) -
                15.59) *
                10
            ) / 10
          )
        : 0;

    // 3. Coleman-Liau
    const L = (charsNoSpaces / (wordCount || 1)) * 100;
    const S = (sentences / (wordCount || 1)) * 100;
    const coleman = Math.max(1, Math.round((0.0588 * L - 0.296 * S - 15.8) * 10) / 10);

    // 4. ARI
    const ari = Math.max(
      1,
      Math.round((4.71 * (charsNoSpaces / (wordCount || 1)) + 0.5 * (wordCount / sentences) - 21.43) * 10) / 10
    );

    // Read times
    const readMinutes = Math.ceil(wordCount / 200);
    const speakMinutes = Math.ceil(wordCount / 130);

    // Longest words
    const uniqueWords = Array.from(new Set(words.map((w) => w.toLowerCase())));
    uniqueWords.sort((a, b) => b.length - a.length);
    const longestWords = uniqueWords.slice(0, 5);

    return {
      words: wordCount,
      characters,
      charsNoSpaces,
      sentences,
      paragraphs,
      syllables: syllableCount,
      readingTime: `${readMinutes} min`,
      speakingTime: `${speakMinutes} min`,
      fleschEase: ease,
      fleschGrade: fkGrade,
      colemanLiau: coleman,
      ari,
      longestWords,
    };
  }, [text]);

  const getEaseRating = (score) => {
    if (score >= 90) return { label: "Very Easy", color: "text-emerald-500" };
    if (score >= 70) return { label: "Easy (Fairly Plain)", color: "text-emerald-600" };
    if (score >= 60) return { label: "Standard (Plain English)", color: "text-blue-500" };
    if (score >= 50) return { label: "Fairly Difficult", color: "text-amber-500" };
    if (score >= 30) return { label: "Difficult (College)", color: "text-orange-500" };
    return { label: "Very Confusing / Graduate", color: "text-red-500" };
  };

  const rating = getEaseRating(stats.fleschEase);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Word Counter & Readability Analyzer</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Client-Side
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Calculate Flesch Reading Ease, grade level complexity, reading time, and comprehensive text metrics.
            </p>
          </div>

          <button
            onClick={() => setText(SAMPLE_TEXT)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            Load Sample Text
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Text Input (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Text Content
            </span>
            <button
              onClick={() => setText("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full flex-1 p-3 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Analytics Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Readability Scorecard */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block pb-2 border-b border-gray-100 dark:border-gray-700">
              Readability Grade
            </span>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.fleschEase}
                  <span className="text-sm font-normal text-gray-400"> / 100</span>
                </div>
                <span className={`text-xs font-bold ${rating.color}`}>{rating.label}</span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  Grade {stats.fleschGrade}
                </div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Flesch-Kincaid</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
              <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Coleman-Liau</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.colemanLiau}</span>
              </div>
              <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Automated Readability</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.ari}</span>
              </div>
            </div>
          </div>

          {/* Counts & Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block pb-2 border-b border-gray-100 dark:border-gray-700">
              Text Statistics
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-500">Words:</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.words}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-500">Characters:</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.characters}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-500">Sentences:</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.sentences}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-500">Paragraphs:</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.paragraphs}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-500">Reading Time:</span>
                <span className="font-bold text-emerald-600">{stats.readingTime}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                <span className="text-gray-500">Speaking Time:</span>
                <span className="font-bold text-blue-600">{stats.speakingTime}</span>
              </div>
            </div>

            {/* Longest Words */}
            {stats.longestWords.length > 0 && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Longest Words
                </span>
                <div className="flex flex-wrap gap-1">
                  {stats.longestWords.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[11px] text-gray-700 dark:text-gray-300"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
