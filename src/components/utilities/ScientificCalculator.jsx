import { useState, useEffect, useCallback, useMemo } from "react";
import { evaluate, format } from "mathjs";

const ScientificCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState("deg"); // 'deg' or 'rad'
  const [error, setError] = useState("");

  // ✅ Fixed: Wrap constants in useMemo to prevent recreation
  const constants = useMemo(
    () => ({
      pi: Math.PI,
      e: Math.E,
      phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
      c: 299792458, // Speed of light
      g: 9.80665, // Gravitational acceleration
    }),
    []
  );

  // ✅ CSS classes as constants to avoid jsx style
  const buttonStyles = {
    number:
      "p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500",
    operator:
      "p-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium focus:ring-2 focus:ring-blue-500",
    function:
      "p-3 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500",
    secondary:
      "p-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500",
    equals:
      "p-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-lg focus:ring-2 focus:ring-green-500",
  };

  // ✅ Wrapped with useCallback for stable references
  const clearDisplay = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setError("");
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
  }, []);

  const deleteLast = useCallback(() => {
    setDisplay((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      } else {
        return "0";
      }
    });
  }, []);

  const appendToDisplay = useCallback((value) => {
    setError("");
    setDisplay((prev) => {
      if (prev === "0" && !isNaN(value)) {
        return value.toString();
      } else {
        return prev + value;
      }
    });
  }, []);

  const appendOperator = useCallback((operator) => {
    setError("");
    setDisplay((prev) => {
      const lastChar = prev.slice(-1);
      if (!["+", "-", "*", "/", "^", "("].includes(lastChar)) {
        return prev + operator;
      }
      return prev;
    });
  }, []);

  const factorial = useCallback((n) => {
    if (n < 0 || n > 170) throw new Error("Factorial out of range");
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }, []);

  const calculate = useCallback(() => {
    try {
      setError("");

      // ✅ Early return if already calculated or invalid
      if (display === "Error" || display === expression) {
        return;
      }

      setDisplay((current) => {
        let expr = current;

        // Replace common math functions with mathjs equivalents
        expr = expr.replace(/sin\(/g, angleMode === "deg" ? "sin(" : "sin(");
        expr = expr.replace(/cos\(/g, angleMode === "deg" ? "cos(" : "cos(");
        expr = expr.replace(/tan\(/g, angleMode === "deg" ? "tan(" : "tan(");

        // Handle degree mode
        if (angleMode === "deg") {
          expr = expr.replace(/sin\(([^)]+)\)/g, "sin(($1 * pi / 180))");
          expr = expr.replace(/cos\(([^)]+)\)/g, "cos(($1 * pi / 180))");
          expr = expr.replace(/tan\(([^)]+)\)/g, "tan(($1 * pi / 180))");
        }

        // Replace constants
        Object.entries(constants).forEach(([name, value]) => {
          const regex = new RegExp(name, "g");
          expr = expr.replace(regex, value.toString());
        });

        const result = evaluate(expr);
        const formattedResult = format(result, { precision: 10 });

        // ✅ Fixed: Prevent duplicate history entries
        setHistory((prev) => {
          // Don't add if the last entry is identical
          if (
            prev.length > 0 &&
            prev[0].expression === current &&
            prev[0].result === formattedResult
          ) {
            return prev;
          }

          return [
            {
              expression: current,
              result: formattedResult,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 19),
          ];
        });

        setExpression(current);
        return formattedResult;
      });
    } catch {
      setError("Invalid expression");
      setDisplay("Error");
    }
  }, [angleMode, constants, display, expression]);

  const applyFunction = useCallback(
    (func) => {
      try {
        setError("");
        setDisplay((prev) => {
          const currentValue = parseFloat(prev) || 0;
          let result;

          switch (func) {
            case "sin":
              result =
                angleMode === "deg"
                  ? Math.sin((currentValue * Math.PI) / 180)
                  : Math.sin(currentValue);
              break;
            case "cos":
              result =
                angleMode === "deg"
                  ? Math.cos((currentValue * Math.PI) / 180)
                  : Math.cos(currentValue);
              break;
            case "tan":
              result =
                angleMode === "deg"
                  ? Math.tan((currentValue * Math.PI) / 180)
                  : Math.tan(currentValue);
              break;
            case "asin":
              result =
                angleMode === "deg"
                  ? (Math.asin(currentValue) * 180) / Math.PI
                  : Math.asin(currentValue);
              break;
            case "acos":
              result =
                angleMode === "deg"
                  ? (Math.acos(currentValue) * 180) / Math.PI
                  : Math.acos(currentValue);
              break;
            case "atan":
              result =
                angleMode === "deg"
                  ? (Math.atan(currentValue) * 180) / Math.PI
                  : Math.atan(currentValue);
              break;
            case "log":
              result = Math.log10(currentValue);
              break;
            case "ln":
              result = Math.log(currentValue);
              break;
            case "sqrt":
              result = Math.sqrt(currentValue);
              break;
            case "square":
              result = currentValue * currentValue;
              break;
            case "cube":
              result = currentValue * currentValue * currentValue;
              break;
            case "reciprocal":
              result = 1 / currentValue;
              break;
            case "factorial":
              result = factorial(Math.floor(currentValue));
              break;
            case "abs":
              result = Math.abs(currentValue);
              break;
            case "negate":
              result = -currentValue;
              break;
            default:
              return prev;
          }

          if (isNaN(result) || !isFinite(result)) {
            throw new Error("Invalid result");
          }

          return format(result, { precision: 10 });
        });
      } catch {
        setError("Invalid operation");
        setDisplay("Error");
      }
    },
    [angleMode, factorial]
  );

  const insertConstant = useCallback((constant) => {
    setError("");
    setDisplay((prev) => {
      if (prev === "0") {
        return constant;
      } else {
        return prev + constant;
      }
    });
  }, []);

  const memoryAdd = useCallback(() => {
    setDisplay((prev) => {
      const value = parseFloat(prev) || 0;
      setMemory((currentMemory) => currentMemory + value);
      return prev;
    });
  }, []);

  const memorySubtract = useCallback(() => {
    setDisplay((prev) => {
      const value = parseFloat(prev) || 0;
      setMemory((currentMemory) => currentMemory - value);
      return prev;
    });
  }, []);

  const memoryRecall = useCallback(() => {
    setDisplay(memory.toString());
  }, [memory]);

  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // ✅ Fixed: Keyboard support with stable dependencies
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;

      if (key >= "0" && key <= "9") {
        appendToDisplay(key);
      } else if (key === ".") {
        appendToDisplay(".");
      } else if (["+", "-", "*", "/"].includes(key)) {
        appendOperator(key);
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
      } else if (key === "Escape") {
        clearDisplay();
      } else if (key === "Backspace") {
        deleteLast();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [appendToDisplay, appendOperator, calculate, clearDisplay, deleteLast]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Scientific Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-2">
            {/* Display */}
            <div className="mb-4 p-4 bg-gray-900 dark:bg-gray-950 rounded-lg">
              <div className="text-right">
                {expression && (
                  <div className="text-sm text-gray-400 mb-1 font-mono">
                    {expression} =
                  </div>
                )}
                <div className="text-2xl md:text-3xl font-mono text-white break-all">
                  {display}
                </div>
                {error && (
                  <div className="text-sm text-red-400 mt-1">{error}</div>
                )}
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Mode: {angleMode.toUpperCase()}</span>
                  {memory !== 0 && <span>M: {memory}</span>}
                </div>
                <button
                  onClick={() =>
                    setAngleMode(angleMode === "deg" ? "rad" : "deg")
                  }
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                  {angleMode}
                </button>
              </div>
            </div>

            {/* Button Grid */}
            <div className="grid grid-cols-6 gap-2">
              {/* Row 1 - Memory and Clear */}
              <button onClick={memoryClear} className={buttonStyles.secondary}>
                MC
              </button>
              <button onClick={memoryRecall} className={buttonStyles.secondary}>
                MR
              </button>
              <button onClick={memoryAdd} className={buttonStyles.secondary}>
                M+
              </button>
              <button
                onClick={memorySubtract}
                className={buttonStyles.secondary}
              >
                M-
              </button>
              <button onClick={clearEntry} className={buttonStyles.secondary}>
                CE
              </button>
              <button onClick={clearDisplay} className={buttonStyles.secondary}>
                C
              </button>

              {/* Row 2 - Functions */}
              <button
                onClick={() => applyFunction("reciprocal")}
                className={buttonStyles.function}
              >
                1/x
              </button>
              <button
                onClick={() => applyFunction("square")}
                className={buttonStyles.function}
              >
                x²
              </button>
              <button
                onClick={() => applyFunction("cube")}
                className={buttonStyles.function}
              >
                x³
              </button>
              <button
                onClick={() => appendToDisplay("^")}
                className={buttonStyles.function}
              >
                xʸ
              </button>
              <button
                onClick={() => applyFunction("sqrt")}
                className={buttonStyles.function}
              >
                √x
              </button>
              <button onClick={deleteLast} className={buttonStyles.secondary}>
                ⌫
              </button>

              {/* Row 3 - More Functions */}
              <button
                onClick={() => applyFunction("sin")}
                className={buttonStyles.function}
              >
                sin
              </button>
              <button
                onClick={() => applyFunction("cos")}
                className={buttonStyles.function}
              >
                cos
              </button>
              <button
                onClick={() => applyFunction("tan")}
                className={buttonStyles.function}
              >
                tan
              </button>
              <button
                onClick={() => applyFunction("log")}
                className={buttonStyles.function}
              >
                log
              </button>
              <button
                onClick={() => applyFunction("ln")}
                className={buttonStyles.function}
              >
                ln
              </button>
              <button
                onClick={() => appendOperator("/")}
                className={buttonStyles.operator}
              >
                ÷
              </button>

              {/* Row 4 - Inverse Functions */}
              <button
                onClick={() => applyFunction("asin")}
                className={buttonStyles.function}
              >
                asin
              </button>
              <button
                onClick={() => applyFunction("acos")}
                className={buttonStyles.function}
              >
                acos
              </button>
              <button
                onClick={() => applyFunction("atan")}
                className={buttonStyles.function}
              >
                atan
              </button>
              <button
                onClick={() => applyFunction("factorial")}
                className={buttonStyles.function}
              >
                n!
              </button>
              <button
                onClick={() => appendToDisplay("(")}
                className={buttonStyles.function}
              >
                (
              </button>
              <button
                onClick={() => appendOperator("*")}
                className={buttonStyles.operator}
              >
                ×
              </button>

              {/* Row 5 - Numbers and Operations */}
              <button
                onClick={() => insertConstant("pi")}
                className={buttonStyles.function}
              >
                π
              </button>
              <button
                onClick={() => insertConstant("e")}
                className={buttonStyles.function}
              >
                e
              </button>
              <button
                onClick={() => applyFunction("abs")}
                className={buttonStyles.function}
              >
                |x|
              </button>
              <button
                onClick={() => applyFunction("negate")}
                className={buttonStyles.function}
              >
                ±
              </button>
              <button
                onClick={() => appendToDisplay(")")}
                className={buttonStyles.function}
              >
                )
              </button>
              <button
                onClick={() => appendOperator("-")}
                className={buttonStyles.operator}
              >
                −
              </button>

              {/* Rows 6-8 - Number Pad */}
              <button
                onClick={() => appendToDisplay("7")}
                className={buttonStyles.number}
              >
                7
              </button>
              <button
                onClick={() => appendToDisplay("8")}
                className={buttonStyles.number}
              >
                8
              </button>
              <button
                onClick={() => appendToDisplay("9")}
                className={buttonStyles.number}
              >
                9
              </button>
              <button
                onClick={() => appendToDisplay("4")}
                className={buttonStyles.number}
              >
                4
              </button>
              <button
                onClick={() => appendToDisplay("5")}
                className={buttonStyles.number}
              >
                5
              </button>
              <button
                onClick={() => appendToDisplay("6")}
                className={buttonStyles.number}
              >
                6
              </button>

              <button
                onClick={() => appendToDisplay("1")}
                className={buttonStyles.number}
              >
                1
              </button>
              <button
                onClick={() => appendToDisplay("2")}
                className={buttonStyles.number}
              >
                2
              </button>
              <button
                onClick={() => appendToDisplay("3")}
                className={buttonStyles.number}
              >
                3
              </button>
              <button
                onClick={() => appendToDisplay("0")}
                className={`${buttonStyles.number} col-span-2`}
              >
                0
              </button>
              <button
                onClick={() => appendToDisplay(".")}
                className={buttonStyles.number}
              >
                .
              </button>

              <button
                onClick={() => appendOperator("+")}
                className={`${buttonStyles.operator} col-span-2`}
              >
                +
              </button>
              <button
                onClick={calculate}
                className={`${buttonStyles.equals} col-span-4`}
              >
                =
              </button>
            </div>
          </div>

          {/* History and Constants */}
          <div className="space-y-6">
            {/* Constants */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Constants
              </h3>
              <div className="space-y-2">
                {Object.entries(constants).map(([name, value]) => (
                  <button
                    key={name}
                    onClick={() => insertConstant(name)}
                    className="w-full p-2 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-mono">{name}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {format(value, { precision: 6 })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  History
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    No calculations yet
                  </div>
                ) : (
                  history.map((calc, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setDisplay(calc.result)}
                    >
                      <div className="font-mono text-gray-600 dark:text-gray-400 text-xs mb-1">
                        {calc.expression}
                      </div>
                      <div className="font-mono text-gray-900 dark:text-white font-medium">
                        = {calc.result}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {calc.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Calculator Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Scientific Functions:</strong> sin, cos, tan, log, ln,
                sqrt
              </li>
              <li>
                • <strong>Memory Operations:</strong> Store, recall, add,
                subtract
              </li>
              <li>
                • <strong>Constants:</strong> π, e, φ (golden ratio), c, g
              </li>
              <li>
                • <strong>Advanced:</strong> Factorial, powers, parentheses
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Angle Modes:</strong> Degrees and radians support
              </li>
              <li>
                • <strong>History:</strong> Last 20 calculations saved
              </li>
              <li>
                • <strong>Keyboard:</strong> Full keyboard input support
              </li>
              <li>
                • <strong>Precision:</strong> High-precision arithmetic
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;
