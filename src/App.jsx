import { BrowserRouter, Routes, Route } from "react-router-dom";
import QRCodeGenerator from "./components/QRCodeGenerator";
import QRCodeScanner from "./components/QRCodeScanner";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={<QRCodeGenerator />} />
          <Route path="/qrscanner" element={<QRCodeScanner />} />
          <Route path="*" element={<div>no page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
