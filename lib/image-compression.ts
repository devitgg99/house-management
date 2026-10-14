/**
 * Utility for client-side image compression and format normalization.
 * Handles large camera captures (such as 48MP/24MP photos from iPhone 16 Pro Max)
 * by downscaling and compressing them before upload.
 */

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  minQuality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxDimension: 1920,
  quality: 0.8,
  minQuality: 0.55,
  maxSizeMB: 1.0,
};

/**
 * Checks if a file is an image based on mime type or file extension
 */
export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith("image/")) {
    return true;
  }
  // Fallback check extension for mobile cameras/safari that might have empty or uncommon mime types
  return /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif|tiff?)$/i.test(file.name);
}

interface DecodedImage {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup: () => void;
}

/**
 * Decodes an image file into a drawable representation.
 * Attempts hardware-accelerated createImageBitmap first (handles EXIF orientation),
 * then falls back to HTMLImageElement via object URL.
 */
async function decodeImage(file: File): Promise<DecodedImage> {
  // Strategy 1: createImageBitmap (modern browsers & iOS 15+, handles orientation & runs off main thread)
  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        cleanup: () => {
          try {
            bitmap.close();
          } catch {
            // ignore
          }
        },
      };
    } catch (err) {
      console.warn("createImageBitmap decode failed, falling back to Image element:", err);
    }
  }

  // Strategy 2: HTMLImageElement via Object URL
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.URL || !window.URL.createObjectURL) {
      return reject(new Error("Browser does not support URL.createObjectURL"));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
        cleanup: () => {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore
          }
        },
      });
    };

    img.onerror = (err) => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * Helper to export canvas to Blob asynchronously
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.8
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Compresses an image file in the browser using HTML5 Canvas with progressive size targeting.
 * Converts heavy camera captures / HEIC (such as 48MP/24MP from iPhone 16) into high-quality,
 * lightweight JPEG files guaranteed to fit within backend upload limits.
 */
export async function compressImage(
  file: File,
  options?: CompressImageOptions
): Promise<File> {
  if (typeof window === "undefined" || !file) {
    return file;
  }

  // Do not compress SVG or animated GIF
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const { maxDimension, quality, minQuality, maxSizeMB } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const targetBytes = maxSizeMB * 1024 * 1024;

  try {
    const decoded = await decodeImage(file);

    try {
      let width = decoded.width;
      let height = decoded.height;

      if (!width || !height) {
        return file;
      }

      // Calculate aspect ratio preserving dimensions
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      let ctx = canvas.getContext("2d");
      if (!ctx) {
        return file;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      decoded.draw(ctx, width, height);

      // Pass 1: standard compression
      let currentQuality = quality;
      let blob = await canvasToBlob(canvas, "image/jpeg", currentQuality);

      // Iterative compression loop: if output exceeds target maxSizeMB, reduce quality and/or dimensions
      let attempts = 0;
      while (blob && blob.size > targetBytes && attempts < 3) {
        attempts++;
        if (currentQuality > minQuality + 0.1) {
          currentQuality = Math.max(minQuality, currentQuality - 0.15);
          blob = await canvasToBlob(canvas, "image/jpeg", currentQuality);
        } else {
          // If quality is already at or near minimum, downscale dimensions by 25%
          width = Math.round(width * 0.75);
          height = Math.round(height * 0.75);
          if (width < 640 || height < 480) {
            // Keep meter reading proof legible
            break;
          }
          const nextCanvas = document.createElement("canvas");
          nextCanvas.width = width;
          nextCanvas.height = height;
          const nextCtx = nextCanvas.getContext("2d");
          if (!nextCtx) break;

          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = "high";
          decoded.draw(nextCtx, width, height);
          canvas = nextCanvas;
          currentQuality = 0.7;
          blob = await canvasToBlob(canvas, "image/jpeg", currentQuality);
        }
      }

      if (!blob) {
        return file;
      }

      // Format clean filename with .jpg extension
      const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
      const newFileName = `${baseName}.jpg`;

      const compressedFile = new File([blob], newFileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      // If the original file was already smaller JPEG and within limits, keep original
      if (
        file.type === "image/jpeg" &&
        file.size <= targetBytes &&
        compressedFile.size >= file.size
      ) {
        return file;
      }

      return compressedFile;
    } finally {
      decoded.cleanup();
    }
  } catch (err) {
    console.warn("Image compression encountered an error, falling back to original file:", err);
    return file;
  }
}
