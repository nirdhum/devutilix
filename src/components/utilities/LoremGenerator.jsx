import { useState } from "react";
import { LoremIpsum } from "lorem-ipsum";

const LoremGenerator = () => {
  const [outputType, setOutputType] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [format, setFormat] = useState("plain");
  const [generatedText, setGeneratedText] = useState("");
  const [textVariant, setTextVariant] = useState("classic");

  // Initialize lorem ipsum generators
  const generators = {
    classic: new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4,
      },
      wordsPerSentence: {
        max: 16,
        min: 4,
      },
    }),
    modern: new LoremIpsum({
      sentencesPerParagraph: {
        max: 6,
        min: 3,
      },
      wordsPerSentence: {
        max: 12,
        min: 3,
      },
      words: [
        "ad",
        "adipisicing",
        "aliqua",
        "aliquip",
        "amet",
        "anim",
        "aute",
        "cillum",
        "commodo",
        "consectetur",
        "consequat",
        "culpa",
        "cupidatat",
        "deserunt",
        "do",
        "dolor",
        "dolore",
        "duis",
        "ea",
        "eiusmod",
        "elit",
        "enim",
        "esse",
        "est",
        "et",
        "eu",
        "ex",
        "excepteur",
        "exercitation",
        "fugiat",
        "id",
        "in",
        "incididunt",
        "ipsum",
        "irure",
        "labore",
        "laboris",
        "laborum",
        "lorem",
        "magna",
        "minim",
        "mollit",
        "nisi",
        "nostrud",
        "nulla",
        "occaecat",
        "officia",
        "pariatur",
        "proident",
        "qui",
        "quis",
        "reprehenderit",
        "sint",
        "sit",
        "sunt",
        "tempor",
        "ullamco",
        "ut",
        "velit",
        "veniam",
        "voluptate",
      ],
    }),
  };

  const alternativeTexts = {
    bacon: [
      "Bacon ipsum dolor amet",
      "pancetta bresaola fatback",
      "turkey meatloaf hamburger",
      "sirloin chuck beef ribs",
      "short loin brisket",
      "pork belly salami",
      "ground round jerky",
      "spare ribs flank",
      "andouille kielbasa",
    ],
    pirate: [
      "Pirate ipsum matey",
      "scurvy bilge rat",
      "landlubber scallywag",
      "cutlass buccaneer",
      "doubloon treasure",
      "parrot pegleg",
      "plank maroon",
      "jolly roger",
      "spanish main",
    ],
    corporate: [
      "Synergize actionable",
      "leverage best practices",
      "paradigm shift solutions",
      "streamline workflows",
      "optimize deliverables",
      "ideate innovations",
      "maximize ROI potential",
      "scalable frameworks",
      "disruptive technologies",
    ],
  };

  const generateText = () => {
    try {
      let result = "";
      const generator = generators[textVariant] || generators.classic;

      if (textVariant === "classic" || textVariant === "modern") {
        switch (outputType) {
          case "words":
            result = generator.generateWords(count);
            break;
          case "sentences":
            result = generator.generateSentences(count);
            break;
          case "paragraphs":
            result = generator.generateParagraphs(count);
            break;
          default:
            result = generator.generateParagraphs(count);
        }

        // Start with "Lorem ipsum" if requested
        if (startWithLorem && !result.toLowerCase().startsWith("lorem ipsum")) {
          const loremStart =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ";

          if (outputType === "words") {
            result = "Lorem ipsum dolor sit amet consectetur adipiscing elit";
          } else if (outputType === "sentences") {
            result = loremStart + result.substring(result.indexOf(".") + 2);
          } else {
            result = loremStart + result;
          }
        }
      } else {
        // Alternative text generators
        const words = alternativeTexts[textVariant];
        let generatedWords = [];

        const totalWords =
          outputType === "words"
            ? count
            : outputType === "sentences"
            ? count * 8
            : count * 50;

        for (let i = 0; i < totalWords; i++) {
          generatedWords.push(words[Math.floor(Math.random() * words.length)]);
        }

        result = generatedWords.join(" ");

        if (outputType === "sentences") {
          const sentences = [];
          const wordsPerSentence = 8;
          for (let i = 0; i < generatedWords.length; i += wordsPerSentence) {
            const sentence = generatedWords
              .slice(i, i + wordsPerSentence)
              .join(" ");
            sentences.push(
              sentence.charAt(0).toUpperCase() + sentence.slice(1) + "."
            );
          }
          result = sentences.join(" ");
        } else if (outputType === "paragraphs") {
          const paragraphs = [];
          const wordsPerParagraph = 50;
          for (let i = 0; i < generatedWords.length; i += wordsPerParagraph) {
            const paragraph = generatedWords
              .slice(i, i + wordsPerParagraph)
              .join(" ");
            paragraphs.push(
              paragraph.charAt(0).toUpperCase() + paragraph.slice(1) + "."
            );
          }
          result = paragraphs.join("\n\n");
        }
      }

      // ✅ Fixed: Apply formatting with proper block scoping
      switch (format) {
        case "html":
          if (outputType === "paragraphs") {
            result = result
              .split("\n\n")
              .map((p) => `<p>${p}</p>`)
              .join("\n");
          } else if (outputType === "sentences") {
            result = `<p>${result}</p>`;
          } else {
            result = `<span>${result}</span>`;
          }
          break;
        case "markdown":
          if (outputType === "paragraphs") {
            result = result.split("\n\n").join("\n\n");
          }
          break;
        case "json": {
          // ✅ Fixed: Added braces for block scope
          const lines =
            outputType === "paragraphs" ? result.split("\n\n") : [result];
          result = JSON.stringify(lines, null, 2);
          break;
        }
        // 'plain' is default, no changes needed
      }

      setGeneratedText(result);
    } catch (error) {
      console.error("Text generation failed:", error);
      setGeneratedText("Error generating text. Please try again.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadAsFile = () => {
    const extension =
      format === "html"
        ? "html"
        : format === "markdown"
        ? "md"
        : format === "json"
        ? "json"
        : "txt";

    const blob = new Blob([generatedText], {
      type:
        format === "html"
          ? "text/html"
          : format === "json"
          ? "application/json"
          : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearText = () => {
    setGeneratedText("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Lorem Ipsum Generator
        </h1>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Generation Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Generation Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Output Type
                </label>
                <select
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="paragraphs">Paragraphs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text Variant
                </label>
                <select
                  value={textVariant}
                  onChange={(e) => setTextVariant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="classic">Classic Lorem Ipsum</option>
                  <option value="modern">Modern Lorem Ipsum</option>
                  <option value="bacon">Bacon Ipsum</option>
                  <option value="pirate">Pirate Ipsum</option>
                  <option value="corporate">Corporate Ipsum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="plain">Plain Text</option>
                  <option value="html">HTML</option>
                  <option value="markdown">Markdown</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  disabled={
                    textVariant !== "classic" && textVariant !== "modern"
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Start with "Lorem ipsum dolor sit amet..."
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Generation Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={generateText}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Generate Text
          </button>

          {generatedText && (
            <>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-500"
              >
                Copy Text
              </button>
              <button
                onClick={downloadAsFile}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                Download
              </button>
              <button
                onClick={clearText}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Generated Text Output */}
        {generatedText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Generated Text
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {generatedText.split(/\s+/).length} words,{" "}
                {generatedText.length} characters
              </div>
            </div>

            <textarea
              readOnly
              value={generatedText}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
            />

            {/* Preview for HTML format */}
            {format === "html" && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  HTML Preview
                </h4>
                <div
                  className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  dangerouslySetInnerHTML={{ __html: generatedText }}
                />
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {generatedText.split(/\s+/).length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Words
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {generatedText.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Characters
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {
                    generatedText
                      .split(/[.!?]+/)
                      .filter((s) => s.trim().length > 0).length
                  }
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Sentences
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {outputType === "paragraphs"
                    ? generatedText.split("\n\n").length
                    : 1}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Paragraphs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            About Lorem Ipsum
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Classic:</strong> Traditional Lorem Ipsum from
                Cicero's writings
              </li>
              <li>
                • <strong>Purpose:</strong> Focus on design without being
                distracted by content
              </li>
              <li>
                • <strong>Industry Standard:</strong> Used by designers and
                developers worldwide
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Alternatives:</strong> Themed variants for specific
                contexts
              </li>
              <li>
                • <strong>Formats:</strong> Plain text, HTML, Markdown, or JSON
                output
              </li>
              <li>
                • <strong>Customizable:</strong> Choose words, sentences, or
                paragraphs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoremGenerator;
