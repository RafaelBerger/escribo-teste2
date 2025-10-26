import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Plano from "./Plano";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/plano" element={<Plano />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
