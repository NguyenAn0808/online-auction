import React, { createContext, useContext, useState, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const ToastContext = createContext(null);

// Design System Colors
const COLORS = {
  WHISPER: "#F8F6F0",
  WHITE: "#FFFFFF",
  SOFT_CLOUD: "#F0EEE6",
  MORNING_MIST: "#B3BFB9",
  MIDNIGHT_ASH: "#1F1F1F",
  PEBBLE: "#938A83",
};

const TOAST_TYPES = {
  success: {
    icon: CheckCircleIcon,
    bgColor: "#D1FAE5",
    borderColor: "#059669",
    iconColor: "#059669",
    textColor: "#065F46",
  },
  error: {
    icon: ExclamationCircleIcon,
    bgColor: "#FEE2E2",
    borderColor: "#DC2626",
    iconColor: "#DC2626",
    textColor: "#991B1B",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: "#FEF3C7",
    borderColor: "#D97706",
    iconColor: "#D97706",
    textColor: "#92400E",
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: "#DBEAFE",
    borderColor: "#2563EB",
    iconColor: "#2563EB",
    textColor: "#1E40AF",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="assertive"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const config = TOAST_TYPES[t.type] || TOAST_TYPES.info;
          const IconComponent = config.icon;

          return (
            <div
              key={t.id}
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                backgroundColor: COLORS.WHITE,
                border: `1px solid ${config.borderColor}`,
                borderLeft: `4px solid ${config.borderColor}`,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                maxWidth: "400px",
                animation: "slideInRight 0.3s ease-out",
              }}
            >
              <IconComponent
                style={{
                  width: "24px",
                  height: "24px",
                  color: config.iconColor,
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  flex: 1,
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 500,
                  color: config.textColor,
                  lineHeight: 1.4,
                }}
              >
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: COLORS.PEBBLE,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = COLORS.SOFT_CLOUD)}
                onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <XMarkIcon style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
