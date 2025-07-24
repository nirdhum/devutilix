import { useState } from "react";

const PasswordGenerator = () => {
  const [passwords, setPasswords] = useState([]);
  const [settings, setSettings] = useState({
    length: 16,
    count: 1,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    noSequential: false,
    noRepeating: false,
  });
  const [error, setError] = useState("");

  // Character sets
  const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    similar: "il1Lo0O", // Characters that look similar
    ambiguous: "{}[]()/\\'\"`~,;.<>", // Characters that might cause issues
  };

  const getCharacterPool = () => {
    let pool = "";

    if (settings.includeUppercase) pool += characterSets.uppercase;
    if (settings.includeLowercase) pool += characterSets.lowercase;
    if (settings.includeNumbers) pool += characterSets.numbers;
    if (settings.includeSymbols) pool += characterSets.symbols;

    // Remove similar characters if requested
    if (settings.excludeSimilar) {
      pool = pool
        .split("")
        .filter((char) => !characterSets.similar.includes(char))
        .join("");
    }

    // Remove ambiguous characters if requested
    if (settings.excludeAmbiguous) {
      pool = pool
        .split("")
        .filter((char) => !characterSets.ambiguous.includes(char))
        .join("");
    }

    return pool;
  };

  const generatePassword = () => {
    const pool = getCharacterPool();

    if (pool.length === 0) {
      throw new Error("No character types selected");
    }

    let password = "";
    const poolArray = pool.split("");

    // Ensure at least one character from each selected set
    const requiredChars = [];
    if (settings.includeUppercase) {
      const upperPool = characterSets.uppercase
        .split("")
        .filter(
          (char) =>
            !settings.excludeSimilar || !characterSets.similar.includes(char)
        )
        .filter(
          (char) =>
            !settings.excludeAmbiguous ||
            !characterSets.ambiguous.includes(char)
        );
      if (upperPool.length > 0) {
        requiredChars.push(
          upperPool[Math.floor(Math.random() * upperPool.length)]
        );
      }
    }
    if (settings.includeLowercase) {
      const lowerPool = characterSets.lowercase
        .split("")
        .filter(
          (char) =>
            !settings.excludeSimilar || !characterSets.similar.includes(char)
        )
        .filter(
          (char) =>
            !settings.excludeAmbiguous ||
            !characterSets.ambiguous.includes(char)
        );
      if (lowerPool.length > 0) {
        requiredChars.push(
          lowerPool[Math.floor(Math.random() * lowerPool.length)]
        );
      }
    }
    if (settings.includeNumbers) {
      const numberPool = characterSets.numbers
        .split("")
        .filter(
          (char) =>
            !settings.excludeSimilar || !characterSets.similar.includes(char)
        );
      if (numberPool.length > 0) {
        requiredChars.push(
          numberPool[Math.floor(Math.random() * numberPool.length)]
        );
      }
    }
    if (settings.includeSymbols) {
      const symbolPool = characterSets.symbols
        .split("")
        .filter(
          (char) =>
            !settings.excludeAmbiguous ||
            !characterSets.ambiguous.includes(char)
        );
      if (symbolPool.length > 0) {
        requiredChars.push(
          symbolPool[Math.floor(Math.random() * symbolPool.length)]
        );
      }
    }

    // Add required characters
    password = requiredChars.join("");

    // Fill the rest randomly
    for (let i = password.length; i < settings.length; i++) {
      let char;
      let attempts = 0;
      do {
        char = poolArray[Math.floor(Math.random() * poolArray.length)];
        attempts++;
      } while (
        (settings.noRepeating && password.includes(char)) ||
        (settings.noSequential &&
          i > 0 &&
          Math.abs(char.charCodeAt(0) - password[i - 1].charCodeAt(0)) === 1 &&
          attempts < 100)
      );
      password += char;
    }

    // Shuffle the password to mix required characters
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const generatePasswords = () => {
    try {
      setError("");

      if (settings.length < 1 || settings.length > 128) {
        throw new Error("Password length must be between 1 and 128 characters");
      }

      if (settings.count < 1 || settings.count > 50) {
        throw new Error("Number of passwords must be between 1 and 50");
      }

      const newPasswords = [];
      for (let i = 0; i < settings.count; i++) {
        newPasswords.push({
          id: Date.now() + i,
          password: generatePassword(),
          strength: 0,
        });
      }

      // Calculate strength for each password
      newPasswords.forEach((item) => {
        item.strength = calculatePasswordStrength(item.password);
      });

      setPasswords(newPasswords);
    } catch (err) {
      setError(err.message);
      setPasswords([]);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 2, 20);

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    // Complexity bonus
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Deduct points for patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns

    return Math.max(0, Math.min(100, score));
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return "text-red-600 dark:text-red-400";
    if (strength < 60) return "text-yellow-600 dark:text-yellow-400";
    if (strength < 80) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStrengthLabel = (strength) => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  const copyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyAllPasswords = async () => {
    try {
      const allPasswords = passwords.map((item) => item.password).join("\n");
      await navigator.clipboard.writeText(allPasswords);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadPreset = (preset) => {
    switch (preset) {
      case "strong":
        setSettings({
          ...settings,
          length: 16,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: true,
          excludeSimilar: true,
          excludeAmbiguous: false,
          noSequential: false,
          noRepeating: false,
        });
        break;
      case "medium":
        setSettings({
          ...settings,
          length: 12,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: false,
          excludeSimilar: true,
          excludeAmbiguous: false,
          noSequential: false,
          noRepeating: false,
        });
        break;
      case "simple":
        setSettings({
          ...settings,
          length: 8,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: false,
          excludeSimilar: false,
          excludeAmbiguous: false,
          noSequential: false,
          noRepeating: false,
        });
        break;
      case "pin":
        setSettings({
          ...settings,
          length: 6,
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: true,
          includeSymbols: false,
          excludeSimilar: false,
          excludeAmbiguous: false,
          noSequential: true,
          noRepeating: true,
        });
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Password Generator
        </h1>

        {/* Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Basic Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Length
                </label>
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={settings.length}
                  onChange={(e) =>
                    updateSetting("length", parseInt(e.target.value) || 16)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.count}
                  onChange={(e) =>
                    updateSetting("count", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Character Types */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Character Types
              </label>
              {[
                {
                  key: "includeUppercase",
                  label: "Uppercase (A-Z)",
                  example: "ABCD",
                },
                {
                  key: "includeLowercase",
                  label: "Lowercase (a-z)",
                  example: "abcd",
                },
                {
                  key: "includeNumbers",
                  label: "Numbers (0-9)",
                  example: "1234",
                },
                {
                  key: "includeSymbols",
                  label: "Symbols (!@#$)",
                  example: "!@#$",
                },
              ].map(({ key, label, example }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}{" "}
                    <code className="text-xs bg-gray-100 dark:bg-gray-600 px-1 rounded">
                      {example}
                    </code>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Advanced Options
            </h3>

            <div className="space-y-2">
              {[
                {
                  key: "excludeSimilar",
                  label: "Exclude similar chars",
                  description: "Avoid: i, l, 1, L, o, 0, O",
                },
                {
                  key: "excludeAmbiguous",
                  label: "Exclude ambiguous chars",
                  description:
                    "Avoid: {, [, (, ), /, \\, ', \", `, ~, ,, ;, ., <, >",
                },
                {
                  key: "noSequential",
                  label: "No sequential chars",
                  description: "Avoid: abc, 123, etc.",
                },
                {
                  key: "noRepeating",
                  label: "No repeating chars",
                  description: "Each char used only once",
                },
              ].map(({ key, label, description }) => (
                <div key={key}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => updateSetting(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "strong", label: "Strong (16 chars)" },
                  { key: "medium", label: "Medium (12 chars)" },
                  { key: "simple", label: "Simple (8 chars)" },
                  { key: "pin", label: "PIN (6 digits)" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={generatePasswords}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
          >
            Generate Password{settings.count > 1 ? "s" : ""}
          </button>
          {passwords.length > 1 && (
            <button
              onClick={copyAllPasswords}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Copy All
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generated Passwords */}
        {passwords.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Generated Password{passwords.length > 1 ? "s" : ""}
            </h3>

            <div className="space-y-3">
              {passwords.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm font-medium ${getStrengthColor(
                          item.strength
                        )}`}
                      >
                        {getStrengthLabel(item.strength)} ({item.strength}%)
                      </span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.strength < 30
                              ? "bg-red-500"
                              : item.strength < 60
                              ? "bg-yellow-500"
                              : item.strength < 80
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${item.strength}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => copyPassword(item.password)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block font-mono text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border break-all">
                    {item.password}
                  </code>
                </div>
              ))}
            </div>

            {/* Character Pool Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Character Pool Information
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <div>
                  Available characters:{" "}
                  <strong>{getCharacterPool().length}</strong>
                </div>
                <div>
                  Possible combinations:{" "}
                  <strong>
                    {Math.pow(
                      getCharacterPool().length,
                      settings.length
                    ).toExponential(2)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tips */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Password Security Tips
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Length matters:</strong> Longer passwords are
                exponentially stronger
              </li>
              <li>
                • <strong>Use variety:</strong> Mix uppercase, lowercase,
                numbers, and symbols
              </li>
              <li>
                • <strong>Avoid patterns:</strong> No dictionary words or
                predictable sequences
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Unique passwords:</strong> Different password for each
                account
              </li>
              <li>
                • <strong>Use a manager:</strong> Password managers help store
                safely
              </li>
              <li>
                • <strong>Enable 2FA:</strong> Two-factor authentication adds
                extra security
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
