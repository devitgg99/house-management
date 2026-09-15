/**
 * High-visibility browser console logger for debugging and troubleshooting.
 * Formats errors and logs with badges, colors, and structured details in Developer Tools (F12).
 */

const isBrowser = typeof window !== "undefined";

export const browserLogger = {
  error: (module: string, message: string, details?: unknown) => {
    if (!isBrowser) {
      console.error(`[${module}] ❌ ${message}`, details ?? "");
      return;
    }
    console.groupCollapsed(
      `%c[${module}]%c ❌ ${message}`,
      "color: #ffffff; background: #dc2626; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #ef4444; font-weight: 600;"
    );
    console.error("Error Message:", message);
    if (details !== undefined) {
      console.error("Error Details / Payload:", details);
    }
    console.trace("Call Stack");
    console.groupEnd();
  },

  warn: (module: string, message: string, details?: unknown) => {
    if (!isBrowser) {
      console.warn(`[${module}] ⚠️ ${message}`, details ?? "");
      return;
    }
    console.groupCollapsed(
      `%c[${module}]%c ⚠️ ${message}`,
      "color: #000000; background: #f59e0b; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #d97706; font-weight: 600;"
    );
    console.warn("Warning Message:", message);
    if (details !== undefined) {
      console.warn("Context:", details);
    }
    console.groupEnd();
  },

  info: (module: string, message: string, details?: unknown) => {
    if (!isBrowser) {
      console.log(`[${module}] ℹ️ ${message}`, details ?? "");
      return;
    }
    console.log(
      `%c[${module}]%c ℹ️ ${message}`,
      "color: #ffffff; background: #2563eb; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #3b82f6; font-weight: normal;",
      details !== undefined ? details : ""
    );
  },

  success: (module: string, message: string, details?: unknown) => {
    if (!isBrowser) {
      console.log(`[${module}] ✅ ${message}`, details ?? "");
      return;
    }
    console.log(
      `%c[${module}]%c ✅ ${message}`,
      "color: #ffffff; background: #16a34a; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #10b981; font-weight: normal;",
      details !== undefined ? details : ""
    );
  },
};
