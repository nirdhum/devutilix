import { useState, useEffect } from "react";
import { createTwoFilesPatch } from "diff";
import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

const TextDiffChecker = () => {
  const [originalText, setOriginalText] = useState("");
  const [changedText, setChangedText] = useState("");
  const [viewType, setViewType] = useState("split");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Inject comprehensive dark mode CSS
  useEffect(() => {
    const styleId = "diff-dark-mode-styles";

    // Remove existing style if it exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* Force dark mode styles with maximum specificity */
      .dark .diff-container .d2h-wrapper,
      .dark .diff-container .d2h-wrapper *,
      [data-theme="dark"] .diff-container .d2h-wrapper,
      [data-theme="dark"] .diff-container .d2h-wrapper * {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
        border-color: #4b5563 !important;
      }
      
      .dark .diff-container .d2h-file-header,
      [data-theme="dark"] .diff-container .d2h-file-header {
        background-color: #374151 !important;
        color: #f3f4f6 !important;
        border-color: #6b7280 !important;
      }
      
      .dark .diff-container .d2h-code-line,
      [data-theme="dark"] .diff-container .d2h-code-line {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
      }
      
      .dark .diff-container .d2h-code-linenumber,
      .dark .diff-container .d2h-code-side-linenumber,
      [data-theme="dark"] .diff-container .d2h-code-linenumber,
      [data-theme="dark"] .diff-container .d2h-code-side-linenumber {
        background-color: #374151 !important;
        color: #9ca3af !important;
        border-color: #4b5563 !important;
      }
      
      /* Added lines (green) */
      .dark .diff-container .d2h-ins,
      .dark .diff-container .d2h-ins *,
      [data-theme="dark"] .diff-container .d2h-ins,
      [data-theme="dark"] .diff-container .d2h-ins * {
        background-color: #065f46 !important;
        color: #d1fae5 !important;
        border-color: #059669 !important;
      }
      
      .dark .diff-container .d2h-ins .d2h-code-line-ctn,
      [data-theme="dark"] .diff-container .d2h-ins .d2h-code-line-ctn {
        background-color: #065f46 !important;
        color: #d1fae5 !important;
      }
      
      /* Deleted lines (red) */
      .dark .diff-container .d2h-del,
      .dark .diff-container .d2h-del *,
      [data-theme="dark"] .diff-container .d2h-del,
      [data-theme="dark"] .diff-container .d2h-del * {
        background-color: #991b1b !important;
        color: #fecaca !important;
        border-color: #dc2626 !important;
      }
      
      .dark .diff-container .d2h-del .d2h-code-line-ctn,
      [data-theme="dark"] .diff-container .d2h-del .d2h-code-line-ctn {
        background-color: #991b1b !important;
        color: #fecaca !important;
      }
      
      .dark .diff-container .d2h-code-line-prefix,
      [data-theme="dark"] .diff-container .d2h-code-line-prefix {
        color: #9ca3af !important;
      }
      
      .dark .diff-container .d2h-file-diff .d2h-code-wrapper,
      [data-theme="dark"] .diff-container .d2h-file-diff .d2h-code-wrapper {
        background-color: #1f2937 !important;
      }
      
      .dark .diff-container table,
      .dark .diff-container tbody,
      .dark .diff-container tr,
      .dark .diff-container td,
      [data-theme="dark"] .diff-container table,
      [data-theme="dark"] .diff-container tbody,
      [data-theme="dark"] .diff-container tr,
      [data-theme="dark"] .diff-container td {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
        border-color: #4b5563 !important;
      }

      /* Mobile optimization for diff2html */
      @media (max-width: 767px) {
        .diff-container .d2h-file-wrapper {
          font-size: 12px !important;
        }
        
        .diff-container .d2h-code-line {
          font-size: 11px !important;
          line-height: 1.4 !important;
        }
        
        .diff-container .d2h-code-linenumber {
          min-width: 30px !important;
          padding: 2px 4px !important;
          font-size: 10px !important;
        }
      }

      /* Media query fallback */
      @media (prefers-color-scheme: dark) {
        .diff-container .d2h-wrapper,
        .diff-container .d2h-wrapper * {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
          border-color: #4b5563 !important;
        }
        
        .diff-container .d2h-file-header {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
          border-color: #6b7280 !important;
        }
        
        .diff-container .d2h-code-line {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        
        .diff-container .d2h-code-linenumber,
        .diff-container .d2h-code-side-linenumber {
          background-color: #374151 !important;
          color: #9ca3af !important;
          border-color: #4b5563 !important;
        }
        
        .diff-container .d2h-ins,
        .diff-container .d2h-ins * {
          background-color: #065f46 !important;
          color: #d1fae5 !important;
          border-color: #059669 !important;
        }
        
        .diff-container .d2h-ins .d2h-code-line-ctn {
          background-color: #065f46 !important;
          color: #d1fae5 !important;
        }
        
        .diff-container .d2h-del,
        .diff-container .d2h-del * {
          background-color: #991b1b !important;
          color: #fecaca !important;
          border-color: #dc2626 !important;
        }
        
        .diff-container .d2h-del .d2h-code-line-ctn {
          background-color: #991b1b !important;
          color: #fecaca !important;
        }
        
        .diff-container .d2h-code-line-prefix {
          color: #9ca3af !important;
        }
        
        .diff-container .d2h-file-diff .d2h-code-wrapper {
          background-color: #1f2937 !important;
        }
        
        .diff-container table,
        .diff-container tbody,
        .diff-container tr,
        .diff-container td {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
          border-color: #4b5563 !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  // Normalize line endings to Unix style on input change
  const handleOriginalChange = (e) => {
    setOriginalText(e.target.value.replace(/\r\n/g, "\n"));
  };
  const handleChangedChange = (e) => {
    setChangedText(e.target.value.replace(/\r\n/g, "\n"));
  };

  // Determine if there is input content in either text area
  const hasContent =
    (originalText && originalText.trim() !== "") ||
    (changedText && changedText.trim() !== "");

  // Generate and parse diff
  let diffHtml = "";
  let hasChanges = false;
  let isIdentical = false;

  if (hasContent) {
    try {
      // Create unified diff patch string
      const patch = createTwoFilesPatch(
        "Original",
        "Changed",
        originalText || "",
        changedText || "",
        "",
        "",
        { context: 3 }
      );

      // Check if texts are identical (patch will be minimal)
      isIdentical = originalText.trim() === changedText.trim();

      if (!isIdentical) {
        // Use unified view on mobile, split view on desktop
        const effectiveViewType = isMobile ? "unified" : viewType;

        // Generate HTML diff
        diffHtml = html(patch, {
          drawFileList: false,
          matching: "lines",
          outputFormat:
            effectiveViewType === "split" ? "side-by-side" : "line-by-line",
        });
        hasChanges = true;
      }
    } catch (error) {
      console.error("Diff generation error:", error);
      diffHtml = "";
      hasChanges = false;
      isIdentical = false;
    }
  }

  // Toggle view type between split (side-by-side) and unified (inline)
  const toggleViewType = () => {
    setViewType((v) => (v === "split" ? "unified" : "split"));
  };

  // Load demo sample texts
  const loadSample = () => {
    setOriginalText(`function sum(a, b) {
  return a + b;
}

console.log(sum(2, 3));`);
    setChangedText(`function sum(a, b) {
  const result = a + b;
  return result;
}

console.log(sum(2, 3));`);
  };

  // Clear both inputs
  const clearAll = () => {
    setOriginalText("");
    setChangedText("");
  };

  // Post-process the diff HTML to add inline styles as fallback
  const processedDiffHtml = diffHtml.replace(
    /<span class="d2h-code-line-ctn">/g,
    '<span class="d2h-code-line-ctn" style="color: inherit !important;">'
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Text Diff Checker
      </h1>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Compare two text inputs and see the differences highlighted.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <textarea
          aria-label="Original Text"
          className="flex-1 p-3 border rounded-md resize-none h-48 font-mono text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Original Text"
          spellCheck={false}
          value={originalText}
          onChange={handleOriginalChange}
        />
        <textarea
          aria-label="Changed Text"
          className="flex-1 p-3 border rounded-md resize-none h-48 font-mono text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Changed Text"
          spellCheck={false}
          value={changedText}
          onChange={handleChangedChange}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={loadSample}
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Load Sample
        </button>
        <button
          onClick={clearAll}
          type="button"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear
        </button>
        {!isMobile && (
          <button
            onClick={toggleViewType}
            type="button"
            aria-pressed={viewType === "split"}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Switch to {viewType === "split" ? "Unified" : "Split"} View
          </button>
        )}
        {isMobile && (
          <div className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm">
            📱 Mobile: Unified View
          </div>
        )}
      </div>

      <div
        role="region"
        aria-live="polite"
        className="overflow-auto border rounded max-h-[600px] bg-gray-50 dark:bg-gray-900"
      >
        {!hasContent ? (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
            Enter text in one or both text areas above to see the diff.
          </p>
        ) : isIdentical ? (
          <p className="p-4 text-center text-green-600 dark:text-green-400">
            ✅ The two texts are identical. No differences found.
          </p>
        ) : hasChanges && diffHtml ? (
          <div
            className="diff-container"
            style={{
              backgroundColor:
                "var(--tw-bg-opacity) ? rgb(31 41 55 / var(--tw-bg-opacity)) : #1f2937",
              color:
                "var(--tw-text-opacity) ? rgb(229 231 235 / var(--tw-text-opacity)) : #e5e7eb",
            }}
            dangerouslySetInnerHTML={{ __html: processedDiffHtml }}
          />
        ) : (
          <p className="p-4 text-center text-red-600 dark:text-red-400">
            ⚠️ Could not compute diff. Please modify input or reload the page.
          </p>
        )}
      </div>
    </div>
  );
};

export default TextDiffChecker;
