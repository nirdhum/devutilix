import { useState } from "react";

const HTMLEncodeDecoder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode"); // 'encode' or 'decode'
  const [error, setError] = useState("");
  const [encodingType, setEncodingType] = useState("basic"); // 'basic' or 'all'

  // HTML entity mappings
  const basicEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  const extendedEntities = {
    ...basicEntities,
    " ": "&nbsp;",
    "¡": "&iexcl;",
    "¢": "&cent;",
    "£": "&pound;",
    "¤": "&curren;",
    "¥": "&yen;",
    "¦": "&brvbar;",
    "§": "&sect;",
    "¨": "&uml;",
    "©": "&copy;",
    ª: "&ordf;",
    "«": "&laquo;",
    "¬": "&not;",
    "®": "&reg;",
    "¯": "&macr;",
    "°": "&deg;",
    "±": "&plusmn;",
    "²": "&sup2;",
    "³": "&sup3;",
    "´": "&acute;",
    µ: "&micro;",
    "¶": "&para;",
    "·": "&middot;",
    "¸": "&cedil;",
    "¹": "&sup1;",
    º: "&ordm;",
    "»": "&raquo;",
    "¼": "&frac14;",
    "½": "&frac12;",
    "¾": "&frac34;",
    "¿": "&iquest;",
    À: "&Agrave;",
    Á: "&Aacute;",
    Â: "&Acirc;",
    Ã: "&Atilde;",
    Ä: "&Auml;",
    Å: "&Aring;",
    Æ: "&AElig;",
    Ç: "&Ccedil;",
    È: "&Egrave;",
    É: "&Eacute;",
    Ê: "&Ecirc;",
    Ë: "&Euml;",
    Ì: "&Igrave;",
    Í: "&Iacute;",
    Î: "&Icirc;",
    Ï: "&Iuml;",
    Ð: "&ETH;",
    Ñ: "&Ntilde;",
    Ò: "&Ograve;",
    Ó: "&Oacute;",
    Ô: "&Ocirc;",
    Õ: "&Otilde;",
    Ö: "&Ouml;",
    "×": "&times;",
    Ø: "&Oslash;",
    Ù: "&Ugrave;",
    Ú: "&Uacute;",
    Û: "&Ucirc;",
    Ü: "&Uuml;",
    Ý: "&Yacute;",
    Þ: "&THORN;",
    ß: "&szlig;",
    à: "&agrave;",
    á: "&aacute;",
    â: "&acirc;",
    ã: "&atilde;",
    ä: "&auml;",
    å: "&aring;",
    æ: "&aelig;",
    ç: "&ccedil;",
    è: "&egrave;",
    é: "&eacute;",
    ê: "&ecirc;",
    ë: "&euml;",
    ì: "&igrave;",
    í: "&iacute;",
    î: "&icirc;",
    ï: "&iuml;",
    ð: "&eth;",
    ñ: "&ntilde;",
    ò: "&ograve;",
    ó: "&oacute;",
    ô: "&ocirc;",
    õ: "&otilde;",
    ö: "&ouml;",
    "÷": "&divide;",
    ø: "&oslash;",
    ù: "&ugrave;",
    ú: "&uacute;",
    û: "&ucirc;",
    ü: "&uuml;",
    ý: "&yacute;",
    þ: "&thorn;",
    ÿ: "&yuml;",
  };

  const encodeHTML = (text, useExtended = false) => {
    const entities = useExtended ? extendedEntities : basicEntities;
    return text.replace(/[&<>"'/]/g, (char) => entities[char] || char);
  };

  const decodeHTML = (text) => {
    // Create reverse mapping for all entities
    const reverseEntities = {};
    Object.entries(extendedEntities).forEach(([char, entity]) => {
      reverseEntities[entity] = char;
    });

    // Also handle numeric entities
    return text
      .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, entityName) => {
        const entity = `&${entityName};`;
        return reverseEntities[entity] || match;
      })
      .replace(/&#(\d+);/g, (match, num) => {
        return String.fromCharCode(parseInt(num, 10));
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
  };

  const processInput = () => {
    try {
      setError("");

      if (!input.trim()) {
        setError("Please enter text to process");
        setOutput("");
        return;
      }

      let result;
      if (mode === "encode") {
        result = encodeHTML(input, encodingType === "all");
      } else {
        result = decodeHTML(input);
      }

      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadSample = () => {
    if (mode === "encode") {
      setInput(
        '<script>alert("XSS Attack");</script>\n<p>Hello "World" & \'Quotes\'</p>\n<div>Price: $100 > $50</div>'
      );
    } else {
      setInput(
        "&lt;script&gt;alert(&quot;XSS Attack&quot;);&lt;/script&gt;\n&lt;p&gt;Hello &quot;World&quot; &amp; &#x27;Quotes&#x27;&lt;/p&gt;\n&lt;div&gt;Price: $100 &gt; $50&lt;/div&gt;"
      );
    }
    setError("");
    setOutput("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const swapMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          HTML Encode/Decode
        </h1>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            <button
              onClick={() => setMode("encode")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "encode"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "decode"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        {/* Encoding Type (only for encode mode) */}
        {mode === "encode" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Encoding Level
            </label>
            <select
              value={encodingType}
              onChange={(e) => setEncodingType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">
                Basic HTML entities (XSS protection)
              </option>
              <option value="all">
                Extended entities (includes special characters)
              </option>
            </select>
          </div>
        )}

        {/* Input Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {mode === "encode" ? "HTML to Encode" : "HTML Entities to Decode"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter HTML content to encode..."
                : "Enter HTML entities to decode..."
            }
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={processInput}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {mode === "encode" ? "Encode HTML" : "Decode HTML"}
          </button>
          <button
            onClick={swapMode}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            ⇄ Swap Mode
          </button>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-500"
          >
            Load Sample
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "encode" ? "Encoded HTML" : "Decoded HTML"}
              </label>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />

            {/* Preview for decoded HTML */}
            {mode === "decode" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview (Rendered HTML)
                </label>
                <div
                  className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ⚠️ Preview shows how the HTML would render (use caution with
                  untrusted content)
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {input.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Input Length
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {output.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Output Length
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {input.length > 0
                    ? Math.round((output.length / input.length) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Size Ratio
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common HTML Entities Reference */}
        {/* Common HTML Entities Reference */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
            Common HTML Entities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div className="space-y-1">
              <div>
                <code>&lt;</code> ← Less than {"(<)"}
              </div>
              <div>
                <code>&gt;</code> ← Greater than {"(>)"}
              </div>
              <div>
                <code>&amp;</code> ← Ampersand {"(&)"}
              </div>
              <div>
                <code>&quot;</code> ← Double quote {'(")'}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <code>&#x27;</code> ← Single quote {"(')"}
              </div>
              <div>
                <code>&#x2F;</code> ← Forward slash {"(/)"}
              </div>
              <div>
                <code>&nbsp;</code> ← Non-breaking space
              </div>
              <div>
                <code>&copy;</code> ← Copyright {"(©)"}
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800 rounded">
            <strong className="text-blue-900 dark:text-blue-200">
              Security Note:
            </strong>
            <span className="text-blue-800 dark:text-blue-300 ml-1">
              HTML encoding helps prevent XSS attacks by converting dangerous
              characters to safe entities.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLEncodeDecoder;
