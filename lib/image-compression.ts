/**
 * Utility for client-side image compression and format normalization.
 * Handles large camera captures (such as 48MP/24MP photos from iPhone 16 Pro Max)
 * by downscaling and compressing them before upload.
 */

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: CompressImageOptions = {
  maxDimension: 2560,
  quality: 0.85,
  maxSizeMB: 50,
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

/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Converts heavy camera captures / HEIC into high-quality JPEG blobs.
 * If compression is not supported, already small, or fails, falls back gracefully to original file.
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

  const { maxDimension = 2560, quality = 0.85 } = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve) => {
    // If browser doesn't support basic canvas or URL, return original
    if (!window.HTMLCanvasElement || !window.URL || !window.URL.createObjectURL) {
      return resolve(file);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If dimensions cannot be determined, resolve original
        if (!width || !height) {
          return resolve(file);
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

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export to JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // Create clean filename ending in .jpg
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const newFileName = `${baseName || "photo"}.jpg`;

            const compressedFile = new File([blob], newFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // If compressed file is actually bigger than original (rare), keep original
            if (compressedFile.size > file.size && file.type.startsWith("image/")) {
              return resolve(file);
            }

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        console.warn("Image compression failed, using original file:", err);
        resolve(file);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn("Could not load image for compression, using original file:", err);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
