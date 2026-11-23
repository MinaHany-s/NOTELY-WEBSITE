import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="bottom-right"
        containerClassName="toast-container"
        toastOptions={{
          duration: 3500,
          className: "app-toast",
          success: { iconTheme: { primary: "#16A36A", secondary: "#FFFFFF" } },
          error: { iconTheme: { primary: "#C94C5D", secondary: "#FFFFFF" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
