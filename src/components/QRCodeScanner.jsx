import React, { useState, useRef, useEffect } from "react";
import { Camera, Square, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const QRCodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [facingMode, setFacingMode] = useState("environment"); // "environment" = back, "user" = front
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // QR Code detection function
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Simple QR code pattern detection (basic implementation)
      // In a real app, you'd use a proper QR code library like jsQR
      const qrData = analyzeImageData(imageData);

      if (qrData) {
        setScannedData(qrData);
        stopScanning();
      }
    }
  };

  // Basic pattern analysis (simplified QR detection)
  const analyzeImageData = (imageData) => {
    // This is a mock implementation
    // In reality, you'd use a library like jsQR or ZXing
    const data = imageData.data;
    let darkPixels = 0;
    let totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < 128) darkPixels++;
    }

    const darkRatio = darkPixels / totalPixels;

    // Mock QR code detection - in reality this would be much more sophisticated
    if (darkRatio > 0.3 && darkRatio < 0.7) {
      // Simulate finding different types of QR codes
      const mockQRCodes = [
        "https://example.com",
        "Hello World!",
        "Contact: John Doe, +1234567890",
        "WiFi:SSID:MyNetwork;PWD:password123",
        '{"name": "Product", "price": "$29.99", "id": "ABC123"}',
      ];
      return mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    }

    return null;
  };

  const startScanning = async () => {
    try {
      setError("");
      setScannedData("");
      setIsLoading(true);
      setDebugInfo("Requesting camera access...");

      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Check if we're on HTTPS or localhost (required for camera access)
      const isSecure =
        location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";
      if (!isSecure) {
        throw new Error("Camera access requires HTTPS connection");
      }

      // Check if we're on mobile for better camera selection
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setDebugInfo(
        `Device: ${isMobile ? "Mobile" : "Desktop"} | Camera: ${
          facingMode === "environment" ? "Back" : "Front"
        }`
      );

      const constraints = {
        video: {
          facingMode: facingMode, // Use selected camera
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          frameRate: { ideal: 30, max: 30 },
        },
      };

      setDebugInfo("Accessing camera...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to load
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve).catch(reject);
          };
          videoRef.current.onerror = reject;
        });
      }

      setIsScanning(true);
      setIsLoading(false);
      setDebugInfo(
        `Camera ready! Using ${
          facingMode === "environment" ? "back" : "front"
        } camera`
      );

      // Start scanning for QR codes
      scanIntervalRef.current = setInterval(detectQRCode, 500);
    } catch (err) {
      setIsLoading(false);
      console.error("Camera error:", err);

      if (err.name === "NotAllowedError") {
        setError(
          "Camera permission denied. Please allow camera access and try again."
        );
        setDebugInfo("User denied camera permission");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
        setDebugInfo("No camera hardware detected");
      } else if (err.name === "NotSupportedError") {
        setError(
          "Camera not supported by this browser. Try Chrome or Firefox."
        );
        setDebugInfo("Browser does not support camera API");
      } else if (err.name === "NotReadableError") {
        setError("Camera is being used by another application.");
        setDebugInfo("Camera hardware is busy");
      } else if (err.message.includes("HTTPS")) {
        setError("Camera access requires a secure connection (HTTPS).");
        setDebugInfo("Insecure connection detected");
      } else if (err.message.includes("Camera API")) {
        setError("Your browser does not support camera access.");
        setDebugInfo("getUserMedia not available");
      } else {
        setError(`Camera error: ${err.message}`);
        setDebugInfo(`Error: ${err.name || "Unknown"}`);
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setIsLoading(false);
    setDebugInfo("");

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    if (isScanning) {
      // If currently scanning, restart with new camera
      stopScanning();
      // Small delay to ensure camera is properly released
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };

  const resetScanner = () => {
    setScannedData("");
    setError("");
    setDebugInfo("");
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <Camera className="mx-auto mb-2 text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">QR Code Scanner</h1>
        <p className="text-gray-600">Point your camera at a QR code to scan</p>
      </div>

      {/* Camera selection */}
      <div className="mb-4 text-center">
        <button
          onClick={switchCamera}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center mx-auto"
          disabled={isLoading}
        >
          <RotateCcw className="mr-2" size={16} />
          {facingMode === "environment"
            ? "Switch to Front Camera"
            : "Switch to Back Camera"}
        </button>
      </div>

      {!isScanning && !scannedData && !error && !isLoading && (
        <div className="text-center">
          <button
            onClick={startScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
          >
            <Camera className="mr-2" size={20} />
            Start Scanning
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Using {facingMode === "environment" ? "back" : "front"} camera
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Starting camera...</p>
          {debugInfo && <p className="text-xs text-gray-500">{debugInfo}</p>}
        </div>
      )}

      {isScanning && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Square
                className="text-white opacity-50"
                size={120}
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={switchCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors flex items-center"
            >
              <RotateCcw className="mr-2" size={16} />
              Switch
            </button>
            <button
              onClick={stopScanning}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors flex items-center"
            >
              <XCircle className="mr-2" size={16} />
              Stop
            </button>
          </div>
        </div>
      )}

      {scannedData && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="text-green-600 mr-2" size={20} />
              <span className="font-semibold text-green-800">
                QR Code Detected!
              </span>
            </div>
            <div className="bg-white p-3 rounded border break-all text-sm">
              {scannedData}
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={resetScanner}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Scan Another
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(scannedData)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Copy Text
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <XCircle className="text-red-600 mr-2" size={20} />
            <span className="font-semibold text-red-800">Error</span>
          </div>
          <p className="text-red-700 text-sm mb-2">{error}</p>
          {debugInfo && (
            <p className="text-xs text-red-600 mb-3">Debug: {debugInfo}</p>
          )}
          <div className="space-y-2">
            <button
              onClick={resetScanner}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Try Again
            </button>
            <details className="text-xs text-red-600">
              <summary className="cursor-pointer hover:text-red-800">
                Troubleshooting Tips
              </summary>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Make sure you're using HTTPS (secure connection)</li>
                <li>Allow camera permissions when prompted</li>
                <li>Close other apps that might be using the camera</li>
                <li>Try refreshing the page</li>
                <li>Use Chrome or Firefox browser</li>
                <li>Check if your device has a camera</li>
                <li>Try switching between front and back camera</li>
              </ul>
            </details>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
        <p>📱 Works on Android Chrome, Firefox, Samsung Internet</p>
        <p>🎯 Point camera at QR code and hold steady</p>
        <p>🔄 Use camera switch button to toggle front/back</p>
        <p>💡 For production: integrate jsQR library for better detection</p>
      </div>
    </div>
  );
};

export default QRCodeScanner;
