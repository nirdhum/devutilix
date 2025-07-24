import { useState, useRef } from "react";
import QRCode from "qrcode";

const QRCodeGenerator = () => {
  const [input, setInput] = useState("");
  const [qrCodeURL, setQrCodeURL] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    errorCorrectionLevel: "M",
    type: "text",
    size: 256,
    margin: 4,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });
  const canvasRef = useRef(null);

  const qrTypes = [
    {
      value: "text",
      label: "Plain Text",
      placeholder: "Enter any text...",
      example: "Hello World!",
    },
    {
      value: "url",
      label: "Website URL",
      placeholder: "https://example.com",
      example: "https://nirdhum.in",
    },
    {
      value: "email",
      label: "Email",
      placeholder: "mailto:email@example.com",
      example: "mailto:contact@example.com?subject=Hello&body=Message",
    },
    {
      value: "phone",
      label: "Phone Number",
      placeholder: "tel:+1234567890",
      example: "tel:+1-555-123-4567",
    },
    {
      value: "sms",
      label: "SMS",
      placeholder: "sms:+1234567890?body=Message",
      example: "sms:+1-555-123-4567?body=Hello from QR code!",
    },
    {
      value: "wifi",
      label: "WiFi Network",
      placeholder: "WIFI:T:WPA;S:NetworkName;P:Password;H:false;;",
      example: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;",
    },
    {
      value: "location",
      label: "Location (GPS)",
      placeholder: "geo:latitude,longitude",
      example: "geo:37.7749,-122.4194",
    },
    {
      value: "vcard",
      label: "Contact Card",
      placeholder: "BEGIN:VCARD...",
      example: `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Company Name
TEL:+1-555-123-4567
EMAIL:john@example.com
END:VCARD`,
    },
  ];

  const generateQRCode = async () => {
    try {
      setError("");

      if (!input.trim()) {
        throw new Error("Please enter content to generate QR code");
      }

      const options = {
        errorCorrectionLevel: settings.errorCorrectionLevel,
        type: "image/png",
        quality: 0.92,
        margin: settings.margin,
        color: {
          dark: settings.colorDark,
          light: settings.colorLight,
        },
        width: settings.size,
      };

      // Generate QR code as data URL
      const url = await QRCode.toDataURL(input, options);
      setQrCodeURL(url);

      // Also draw to canvas for download functionality
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, input, options);
      }
    } catch (err) {
      setError(err.message);
      setQrCodeURL("");
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeURL) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeURL;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      // Convert data URL to blob and copy to clipboard
      const response = await fetch(qrCodeURL);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      console.error("Failed to copy image:", err);
      // Fallback: copy the data URL
      try {
        await navigator.clipboard.writeText(qrCodeURL);
      } catch (err2) {
        console.error("Failed to copy data URL:", err2);
      }
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadExample = (type) => {
    const example = qrTypes.find((t) => t.value === type)?.example || "";
    setInput(example);
    updateSetting("type", type);
  };

  const clearAll = () => {
    setInput("");
    setQrCodeURL("");
    setError("");
  };

  const getQRInfo = () => {
    if (!input) return null;

    return {
      contentLength: input.length,
      estimatedSize: `${settings.size}×${settings.size}px`,
      errorCorrection: settings.errorCorrectionLevel,
      type: settings.type,
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          QR Code Generator
        </h1>

        {/* QR Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            QR Code Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {qrTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => updateSetting("type", type.value)}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  settings.type === type.value
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <button
              onClick={() => loadExample(settings.type)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Load Example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              qrTypes.find((t) => t.value === settings.type)?.placeholder ||
              "Enter content..."
            }
            rows={settings.type === "vcard" ? 8 : 4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Size (px)
            </label>
            <input
              type="number"
              min="128"
              max="1024"
              step="32"
              value={settings.size}
              onChange={(e) =>
                updateSetting("size", parseInt(e.target.value) || 256)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Error Correction
            </label>
            <select
              value={settings.errorCorrectionLevel}
              onChange={(e) =>
                updateSetting("errorCorrectionLevel", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Foreground Color
            </label>
            <input
              type="color"
              value={settings.colorDark}
              onChange={(e) => updateSetting("colorDark", e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={settings.colorLight}
              onChange={(e) => updateSetting("colorLight", e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={generateQRCode}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
          >
            Generate QR Code
          </button>
          {qrCodeURL && (
            <>
              <button
                onClick={downloadQRCode}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-500"
              >
                Download PNG
              </button>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                Copy Image
              </button>
            </>
          )}
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* QR Code Display */}
        {qrCodeURL && (
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Generated QR Code
            </h3>

            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <img
                src={qrCodeURL}
                alt="Generated QR Code"
                className="max-w-full h-auto"
                style={{ maxWidth: "400px" }}
              />
            </div>

            {/* Hidden canvas for download */}
            <canvas ref={canvasRef} className="hidden" />

            {/* QR Code Info */}
            {getQRInfo() && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {getQRInfo().contentLength}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    Characters
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {getQRInfo().estimatedSize}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    Dimensions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {getQRInfo().errorCorrection}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    Error Correction
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 capitalize">
                    {getQRInfo().type}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    Content Type
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Examples Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
            QR Code Examples & Use Cases
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ul className="space-y-1">
              <li>
                • <strong>Website URLs:</strong> Share links easily
              </li>
              <li>
                • <strong>WiFi Credentials:</strong> Connect guests instantly
              </li>
              <li>
                • <strong>Contact Cards:</strong> Share contact information
              </li>
              <li>
                • <strong>Payment Links:</strong> Accept payments quickly
              </li>
            </ul>
            <ul className="space-y-1">
              <li>
                • <strong>Location Sharing:</strong> GPS coordinates
              </li>
              <li>
                • <strong>App Store Links:</strong> Download mobile apps
              </li>
              <li>
                • <strong>Social Media:</strong> Follow profiles
              </li>
              <li>
                • <strong>Event Info:</strong> Calendar events and tickets
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
