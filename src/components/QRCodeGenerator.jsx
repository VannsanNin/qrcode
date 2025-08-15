import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://www.startupthecode.xyz/");
  const [level, setLevel] = useState("L");
  const [size, setSize] = useState(200);

  return (
    <div className="text-center p-5">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        QR Code Generator
      </h2>

      <input
        type="text"
        placeholder="Enter text or URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="px-4 m-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input
        type="text"
        placeholder="Enter text or URL"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        className="px-4 m-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="mt-4">
        <label className="text-gray-700 font-medium mr-2">
          Correction Level:
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="L">L (Low)</option>
          <option value="M">M (Medium)</option>
          <option value="Q">Q (Quartile)</option>
          <option value="H">H (High)</option>
        </select>
      </div>

      <div className="mt-6">
        {text && (
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
            <QRCodeCanvas value={text} size={size} level={level} />
          </div>
        )}
      </div>
    </div>
  );
}
