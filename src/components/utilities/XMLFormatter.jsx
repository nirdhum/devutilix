import { useState } from "react";

const XMLFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("prettify"); // 'prettify' or 'minify'
  const [indent, setIndent] = useState(2);
  const [xmlInfo, setXmlInfo] = useState(null);

  const parseXML = (xmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
      throw new Error(errorNode.textContent || "XML parsing error");
    }

    return doc;
  };

  const analyzeXML = (doc) => {
    const getAllElements = (node) => {
      let elements = [];
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements.push(node);
      }
      for (let child of node.childNodes) {
        elements = elements.concat(getAllElements(child));
      }
      return elements;
    };

    const elements = getAllElements(doc);
    const elementNames = new Set();
    const attributes = new Set();
    let textNodes = 0;
    let maxDepth = 0;

    const calculateDepth = (node, depth = 0) => {
      maxDepth = Math.max(maxDepth, depth);
      if (node.nodeType === Node.ELEMENT_NODE) {
        elementNames.add(node.tagName);
        // Count attributes
        for (let attr of node.attributes || []) {
          attributes.add(attr.name);
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        textNodes++;
      }

      for (let child of node.childNodes) {
        calculateDepth(child, depth + 1);
      }
    };

    calculateDepth(doc);

    return {
      totalElements: elements.length,
      uniqueElementTypes: elementNames.size,
      totalAttributes: attributes.size,
      textNodes,
      maxDepth,
      rootElement: doc.documentElement?.tagName || "Unknown",
      hasNamespaces: input.includes("xmlns"),
      elementTypes: Array.from(elementNames).sort(),
      attributeNames: Array.from(attributes).sort(),
    };
  };

  const formatXML = (xmlString, indentSize = 2) => {
    const doc = parseXML(xmlString);
    return prettifyXMLNode(doc, 0, indentSize);
  };

  const prettifyXMLNode = (node, level = 0, indentSize = 2) => {
    const indent = " ".repeat(level * indentSize);
    const nextIndent = " ".repeat((level + 1) * indentSize);

    if (node.nodeType === Node.DOCUMENT_NODE) {
      let result = "";
      if (node.xmlVersion || node.xmlEncoding) {
        result += `<?xml version="${node.xmlVersion || "1.0"}" encoding="${
          node.xmlEncoding || "UTF-8"
        }"?>\n`;
      }
      for (let child of node.childNodes) {
        result += prettifyXMLNode(child, level, indentSize);
      }
      return result;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      let result = indent + "<" + node.tagName;

      // Add attributes
      if (node.attributes && node.attributes.length > 0) {
        for (let attr of node.attributes) {
          result += ` ${attr.name}="${attr.value}"`;
        }
      }

      // Check if element has children
      const hasElementChildren = Array.from(node.childNodes).some(
        (child) => child.nodeType === Node.ELEMENT_NODE
      );
      const hasTextContent = Array.from(node.childNodes).some(
        (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim()
      );

      if (node.childNodes.length === 0) {
        result += "/>\n";
      } else if (
        hasTextContent &&
        !hasElementChildren &&
        node.childNodes.length === 1
      ) {
        // Single text node - keep on same line
        result += ">" + node.textContent + "</" + node.tagName + ">\n";
      } else {
        result += ">\n";

        // Process children
        for (let child of node.childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            result += prettifyXMLNode(child, level + 1, indentSize);
          } else if (
            child.nodeType === Node.TEXT_NODE &&
            child.textContent.trim()
          ) {
            result += nextIndent + child.textContent.trim() + "\n";
          }
        }

        result += indent + "</" + node.tagName + ">\n";
      }

      return result;
    }

    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      return indent + node.textContent.trim() + "\n";
    }

    return "";
  };

  const minifyXML = (xmlString) => {
    const doc = parseXML(xmlString);
    return new XMLSerializer()
      .serializeToString(doc)
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .trim();
  };

  const processXML = () => {
    try {
      setError("");

      if (!input.trim()) {
        throw new Error("Please enter XML to format");
      }

      // Add XML declaration if missing and input doesn't start with <?xml
      let xmlToProcess = input.trim();
      if (!xmlToProcess.startsWith("<?xml") && !xmlToProcess.startsWith("<")) {
        throw new Error("Invalid XML: Document must start with an XML element");
      }

      const doc = parseXML(xmlToProcess);
      const analysis = analyzeXML(doc);
      setXmlInfo(analysis);

      let result;
      if (mode === "prettify") {
        result = formatXML(xmlToProcess, indent);
      } else {
        result = minifyXML(xmlToProcess);
      }

      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput("");
      setXmlInfo(null);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadSample = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<library xmlns:book="http://example.com/book">
<book:catalog>
<book:book id="1" category="fiction">
<book:title lang="en">The Great Gatsby</book:title>
<book:author>
<book:name>F. Scott Fitzgerald</book:name>
<book:nationality>American</book:nationality>
</book:author>
<book:published year="1925"/>
<book:isbn>978-0-7432-7356-5</book:isbn>
<book:price currency="USD">12.99</book:price>
</book:book>
<book:book id="2" category="science">
<book:title lang="en">A Brief History of Time</book:title>
<book:author>
<book:name>Stephen Hawking</book:name>
<book:nationality>British</book:nationality>
</book:author>
<book:published year="1988"/>
<book:isbn>978-0-553-38016-3</book:isbn>
<book:price currency="USD">15.99</book:price>
</book:book>
</book:catalog>
</library>`;
    setInput(sample);
    setOutput("");
    setError("");
    setXmlInfo(null);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setXmlInfo(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          XML Formatter
        </h1>

        {/* Mode Selection */}
        <div className="mb-4">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700 max-w-md">
            <button
              onClick={() => setMode("prettify")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "prettify"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Prettify
            </button>
            <button
              onClick={() => setMode("minify")}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                mode === "minify"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Minify
            </button>
          </div>
        </div>

        {/* Options */}
        {mode === "prettify" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Indent Size
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={indent}
              onChange={(e) => setIndent(parseInt(e.target.value) || 2)}
              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={processXML}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {mode === "prettify" ? "Format XML" : "Minify XML"}
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

        {/* Input/Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Input XML
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your XML here..."
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Formatted XML
              </label>
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {output.length} characters
                </span>
                {output && (
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm font-mono">
              {error}
            </p>
          </div>
        )}

        {/* XML Analysis */}
        {xmlInfo && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">
              ✅ Valid XML Document
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-green-800 dark:text-green-300">
              <div>
                <strong>Root Element:</strong> {xmlInfo.rootElement}
              </div>
              <div>
                <strong>Total Elements:</strong> {xmlInfo.totalElements}
              </div>
              <div>
                <strong>Element Types:</strong> {xmlInfo.uniqueElementTypes}
              </div>
              <div>
                <strong>Max Depth:</strong> {xmlInfo.maxDepth}
              </div>
              <div>
                <strong>Attributes:</strong> {xmlInfo.totalAttributes}
              </div>
              <div>
                <strong>Text Nodes:</strong> {xmlInfo.textNodes}
              </div>
              <div>
                <strong>Namespaces:</strong>{" "}
                {xmlInfo.hasNamespaces ? "Yes" : "No"}
              </div>
              <div>
                <strong>File Size:</strong> {new Blob([input]).size} bytes
              </div>
            </div>

            {xmlInfo.elementTypes.length > 0 && (
              <div className="mt-3">
                <strong className="text-green-900 dark:text-green-200">
                  Element Types:
                </strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {xmlInfo.elementTypes.slice(0, 10).map((element, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs font-mono"
                    >
                      &lt;{element}&gt;
                    </span>
                  ))}
                  {xmlInfo.elementTypes.length > 10 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs">
                      +{xmlInfo.elementTypes.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            XML Formatter Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Validation:</strong> Real-time XML syntax checking
              </li>
              <li>
                • <strong>Formatting:</strong> Pretty-print with custom
                indentation
              </li>
              <li>
                • <strong>Minification:</strong> Remove whitespace for compact
                XML
              </li>
              <li>
                • <strong>Analysis:</strong> Document structure and element
                statistics
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Namespace Support:</strong> Handle XML namespaces
                properly
              </li>
              <li>
                • <strong>Attribute Handling:</strong> Preserve and format
                attributes
              </li>
              <li>
                • <strong>Error Reporting:</strong> Detailed parsing error
                messages
              </li>
              <li>
                • <strong>Element Detection:</strong> Count and categorize XML
                elements
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XMLFormatter;
