import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures image and resource URLs use HTTPS when served over secure networks (like Tailscale)
 * to avoid browser mixed-content blocking.
 */
export function ensureHttps(url?: string | null): string | null {
  if (!url) return null;

  let formattedUrl = url;

  // If it's a relative upload path like "uploads/..." or "/uploads/..."
  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://") &&
    !formattedUrl.startsWith("blob:") &&
    !formattedUrl.startsWith("data:")
  ) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const backendHost = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
    if (backendHost) {
      const cleanPath = formattedUrl.startsWith("/") ? formattedUrl.slice(1) : formattedUrl;
      formattedUrl = `${backendHost}/${cleanPath}`;
    }
  }

  if (formattedUrl.startsWith("http://") && !formattedUrl.includes("localhost") && !formattedUrl.includes("127.0.0.1")) {
    return formattedUrl.replace(/^http:\/\//i, "https://");
  }

  return formattedUrl;
}
