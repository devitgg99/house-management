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
  if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
    return url.replace(/^http:\/\//i, "https://");
  }
  return url;
}
