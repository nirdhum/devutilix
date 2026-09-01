"use client";

import { useState, useMemo } from "react";

const SAMPLE_XML = `<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>12.99</price>
  </book>
  <book category="technology">
    <title lang="en">Designing Data-Intensive Applications</title>
    <author>Martin Kleppmann</author>
    <year>2017</year>
    <price>39.95</price>
  </book>
</bookstore>`;

const SAMPLE_JSON = JSON.stringify(
  {
    bookstore: {
      book: [
        {
          "@attributes": { category: "fiction" },
          title: { "@attributes": { lang: "en" }, "#text": "The Great Gatsby" },
          author: "F. Scott Fitzgerald",
          year: 1925,
          price: 12.99,
        },
        {
          "@attributes": { category: "technology" },
          title: { "@attributes": { lang: "en" }, "#text": "Designing Data-Intensive Applications" },
          author: "Martin Kleppmann",
          year: 2017,
          price: 39.95,
        },
      ],
    },
  },
  null,
  2
);

// XML Node to JS Object
function xmlToObj(node) {
  // If text or CDATA node
  if (node.nodeType === 3 || node.nodeType === 4) {
    return node.nodeValue.trim();
  }

  const obj = {};

  // Attributes
  if (node.attributes && node.attributes.length > 0) {
    obj["@attributes"] = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      obj["@attributes"][attr.name] = attr.value;
    }
  }

  // Children
  if (node.hasChildNodes()) {
    const textChildren = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === 3 || child.nodeType === 4) {
        const text = child.nodeValue.trim();
        if (text) textChildren.push(text);
      } else if (child.nodeType === 1) {
        const nodeName = child.nodeName;
        const val = xmlToObj(child);
        if (obj[nodeName] === undefined) {
          obj[nodeName] = val;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(val);
        }
      }
    }

    if (textChildren.length > 0) {
      if (Object.keys(obj).length === 0) {
        return textChildren.join(" ");
      } else {
        obj["#text"] = textChildren.join(" ");
      }
    }
  }

  return obj;
}

// JS Object to XML
function objToXml(obj, tag = "root", depth = 0) {
  const indent = "  ".repeat(depth);
  if (obj === null || obj === undefined) return `${indent}<${tag} />\n`;

  if (typeof obj !== "object") {
    return `${indent}<${tag}>${String(obj)}</${tag}>\n`;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objToXml(item, tag, depth)).join("");
  }

  let attrs = "";
  let text = "";
  const children = [];

  for (const [k, v] of Object.entries(obj)) {
    if (k === "@attributes" && typeof v === "object") {
      attrs = Object.entries(v)
        .map(([attrKey, attrVal]) => ` ${attrKey}="${String(attrVal).replace(/"/g, "&quot;")}"`)
        .join("");
    } else if (k === "#text") {
      text = String(v);
    } else {
      children.push({ key: k, val: v });
    }
  }

  if (children.length === 0 && !text) {
    return `${indent}<${tag}${attrs} />\n`;
  }

  if (children.length === 0 && text) {
    return `${indent}<${tag}${attrs}>${text}</${tag}>\n`;
  }

  let xml = `${indent}<${tag}${attrs}>\n`;
  if (text) {
    xml += `${indent}  ${text}\n`;
  }
  for (const child of children) {
    xml += objToXml(child.val, child.key, depth + 1);
  }
  xml += `${indent}</${tag}>\n`;
  return xml;
}

export default function XMLJSONConverter() {
  const [direction, setDirection] = useState("xml-to-json"); // xml-to-json | json-to-xml
  const [inputVal, setInputVal] = useState(SAMPLE_XML);
  const [copied, setCopied] = useState(false);

  const { outputVal, error } = useMemo(() => {
    try {
      const clean = inputVal.trim();
      if (!clean) return { outputVal: "", error: null };

      if (direction === "xml-to-json") {
        const parser = new DOMParser();
        const doc = parser.parseFromString(clean, "application/xml");
        const parseError = doc.querySelector("parsererror");
        if (parseError) {
          return { outputVal: "", error: parseError.textContent || "XML parse error" };
        }
        const obj = { [doc.documentElement.nodeName]: xmlToObj(doc.documentElement) };
        return { outputVal: JSON.stringify(obj, null, 2), error: null };
      } else {
        const parsed = JSON.parse(clean);
        const keys = Object.keys(parsed);
        let xmlResult = "";
        if (keys.length === 1 && typeof parsed[keys[0]] === "object" && !Array.isArray(parsed[keys[0]])) {
          xmlResult = objToXml(parsed[keys[0]], keys[0]);
        } else {
          xmlResult = objToXml(parsed, "root");
        }
        return { outputVal: `<?xml version="1.0" encoding="UTF-8"?>\n${xmlResult.trim()}`, error: null };
      }
    } catch (err) {
      return { outputVal: "", error: err.message };
    }
  }, [direction, inputVal]);

  const handleSwitchDirection = (newDir) => {
    setDirection(newDir);
    if (newDir === "xml-to-json") {
      setInputVal(SAMPLE_XML);
    } else {
      setInputVal(SAMPLE_JSON);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputVal);
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
              <span>XML ↔ JSON Converter</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium">
                Bidirectional
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Convert XML documents into structured JSON objects, or serialize JSON trees into clean XML markup.
            </p>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => handleSwitchDirection("xml-to-json")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                direction === "xml-to-json"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              XML ➔ JSON
            </button>
            <button
              onClick={() => handleSwitchDirection("json-to-xml")}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                direction === "json-to-xml"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              JSON ➔ XML
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {direction === "xml-to-json" ? "XML Input" : "JSON Input"}
            </span>
            <button
              onClick={() => setInputVal("")}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={18}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Paste ${direction === "xml-to-json" ? "XML" : "JSON"} here...`}
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {direction === "xml-to-json" ? "Converted JSON" : "Converted XML"}
            </span>
            <button
              onClick={handleCopy}
              disabled={!outputVal}
              className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors disabled:opacity-50"
            >
              {copied ? "✓ Copied!" : "Copy Output"}
            </button>
          </div>
          <textarea
            readOnly
            rows={18}
            value={outputVal}
            placeholder="Converted output will appear here..."
            className="w-full flex-1 p-3 text-xs font-mono bg-gray-900 text-green-400 border border-gray-800 rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
