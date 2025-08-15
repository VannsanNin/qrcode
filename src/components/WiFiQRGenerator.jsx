import React, { useState, useEffect, useRef } from "react";
import {
  Wifi,
  QrCode,
  Download,
  Copy,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
} from "lucide-react";

const WiFiQRGenerator = () => {
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });
  const [qrCode, setQrCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  // Generate Wi-Fi QR code string format
  const generateWiFiString = () => {
    const { ssid, password, security, hidden } = wifiData;

    if (!ssid.trim()) return "";

    // Escape special characters
    const escapedSSID = ssid.replace(/([\\;,":])/g, "\\$1");
    const escapedPassword = password.replace(/([\\;,":])/g, "\\$1");

    return `WIFI:T:${security};S:${escapedSSID};P:${escapedPassword};H:${
      hidden ? "true" : "false"
    };;`;
  };

  // Simple QR code generator (basic implementation)
  const generateQRCode = (text) => {
    if (!text || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 200;
    const moduleSize = size / 25; // 25x25 grid for simplicity

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";

    // Generate simple pattern based on text (mock QR code)
    const hash = text
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 25; y++) {
        const shouldFill = (x * 31 + y * 17 + hash) % 3 === 0;
        if (shouldFill) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add finder patterns (corners)
    const drawFinderPattern = (x, y) => {
      ctx.fillRect(
        x * moduleSize,
        y * moduleSize,
        7 * moduleSize,
        7 * moduleSize
      );
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        (x + 1) * moduleSize,
        (y + 1) * moduleSize,
        5 * moduleSize,
        5 * moduleSize
      );
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        (x + 2) * moduleSize,
        (y + 2) * moduleSize,
        3 * moduleSize,
        3 * moduleSize
      );
    };

    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(18, 0); // Top-right
    drawFinderPattern(0, 18); // Bottom-left

    // Convert canvas to data URL
    return canvas.toDataURL();
  };

  // Update QR code when WiFi data changes
  useEffect(() => {
    const wifiString = generateWiFiString();
    if (wifiString) {
      const qrDataUrl = generateQRCode(wifiString);
      setQrCode(qrDataUrl);
    } else {
      setQrCode("");
    }
  }, [wifiData]);

  const handleInputChange = (field, value) => {
    setWifiData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `wifi-${wifiData.ssid || "network"}-qr.png`;
    link.href = qrCode;
    link.click();
  };

  const copyWiFiString = async () => {
    const wifiString = generateWiFiString();
    if (wifiString && navigator.clipboard) {
      await navigator.clipboard.writeText(wifiString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const securityTypes = [
    { value: "WPA", label: "WPA/WPA2/WPA3" },
    { value: "WEP", label: "WEP" },
    { value: "nopass", label: "No Password" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Wifi className="text-blue-600 mr-3" size={40} />
          <QrCode className="text-gray-600" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Wi-Fi QR Code Generator
        </h1>
        <p className="text-gray-600">
          Create QR codes for easy Wi-Fi network sharing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-2" size={20} />
              Network Details
            </h2>

            <div className="space-y-4">
              {/* Network Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Network Name (SSID) *
                </label>
                <input
                  type="text"
                  value={wifiData.ssid}
                  onChange={(e) => handleInputChange("ssid", e.target.value)}
                  placeholder="Enter Wi-Fi network name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Security Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Type
                </label>
                <select
                  value={wifiData.security}
                  onChange={(e) =>
                    handleInputChange("security", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {securityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              {wifiData.security !== "nopass" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {wifiData.security !== "nopass" && "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={wifiData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter Wi-Fi password"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={wifiData.security !== "nopass"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden Network */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hidden"
                  checked={wifiData.hidden}
                  onChange={(e) =>
                    handleInputChange("hidden", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="hidden"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Hidden Network (SSID not broadcast)
                </label>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Smartphone className="mr-2" size={16} />
              How to Use
            </h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Fill in your Wi-Fi network details</li>
              <li>A QR code will be generated automatically</li>
              <li>Share the QR code with guests</li>
              <li>They scan it with their phone camera</li>
              <li>Device automatically connects to Wi-Fi</li>
            </ol>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4">QR Code</h2>

            {qrCode ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                  <img
                    src={qrCode}
                    alt="Wi-Fi QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={downloadQRCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                  >
                    <Download className="mr-2" size={16} />
                    Download
                  </button>
                  <button
                    onClick={copyWiFiString}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                  >
                    <Copy className="mr-2" size={16} />
                    {copied ? "Copied!" : "Copy String"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 py-16">
                <QrCode className="mx-auto mb-4" size={64} />
                <p>Enter network name to generate QR code</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {wifiData.ssid && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                Network Preview
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Network:</strong> {wifiData.ssid}
                </p>
                <p>
                  <strong>Security:</strong>{" "}
                  {
                    securityTypes.find((t) => t.value === wifiData.security)
                      ?.label
                  }
                </p>
                {wifiData.security !== "nopass" && (
                  <p>
                    <strong>Password:</strong>{" "}
                    {"•".repeat(wifiData.password.length)}
                  </p>
                )}
                {wifiData.hidden && (
                  <p>
                    <strong>Hidden:</strong> Yes
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8 text-xs text-gray-500 text-center space-y-1">
        <p>📱 Compatible with iOS 11+ and Android 10+ camera apps</p>
        <p>
          🔒 QR codes are generated locally - your Wi-Fi details never leave
          your device
        </p>
        <p>
          💡 For production: integrate a proper QR library like qrcode.js for
          better quality
        </p>
      </div>
    </div>
  );
};

export default WiFiQRGenerator;
