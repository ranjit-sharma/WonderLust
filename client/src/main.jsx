import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "./lib/toast.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* reducedMotion="never" ensures animations always play smoothly */}
    <MotionConfig reducedMotion="never">
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
