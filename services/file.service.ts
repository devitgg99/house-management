const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type FileUploadResponse = {
  success: boolean;
  url?: string;
  error?: string;
  data?: any;
};

const cleanPathString = (val?: any): string => {
  if (!val) return "";
  let s = String(val).trim();
  // Strip surrounding and trailing quotes, escaped quotes, and encoded quotes (%22, %27)
  s = s.replace(/^["'`\\]+|["'`\\]+$/g, "").replace(/%22|%27/gi, "").trim();
  return s;
};

export const UploadFileService = async (formData: FormData): Promise<FileUploadResponse> => {
  const startTime = Date.now();

  // Extract file info for backend logging
  const fileEntry = formData.get("file");
  let fileName = "unknown-file";
  let fileSize = 0;
  let fileType = "unknown";

  if (fileEntry && typeof fileEntry === "object" && "size" in fileEntry) {
    const f = fileEntry as File;
    fileName = f.name || "unnamed";
    fileSize = f.size || 0;
    fileType = f.type || "unknown";
  }

  const fileSizeKB = (fileSize / 1024).toFixed(1);
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const targetUrl = `${API_BASE_URL}/file/upload`;

  console.log(
    `[Backend-Upload] 📤 Sending "${fileName}" (${fileType}, ${fileSizeKB} KB / ${fileSizeMB} MB) -> ${targetUrl}`
  );

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });

    const elapsed = Date.now() - startTime;
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log(
      `[Backend-Upload] 📥 Backend responded in ${elapsed}ms | HTTP ${res.status} ${res.statusText} | File: "${fileName}" (${fileSizeMB} MB)`
    );

    // Look for file path / URL across common backend response schemas
    let rawPath: string | undefined;

    if (typeof data === "string") {
      rawPath = data;
    } else if (data && typeof data === "object") {
      // Check explicit URL/path fields first
      if (typeof data.url === "string") rawPath = data.url;
      else if (typeof data.data?.url === "string") rawPath = data.data.url;
      else if (typeof data.fileUrl === "string") rawPath = data.fileUrl;
      else if (typeof data.filePath === "string") rawPath = data.filePath;
      else if (typeof data.path === "string") rawPath = data.path;
      else if (typeof data.data === "string") rawPath = data.data;
      else if (typeof data.fileName === "string") rawPath = data.fileName;
      else if (typeof data.filename === "string") rawPath = data.filename;
      // Check message or error fields if they contain a valid file/upload path
      else if (
        typeof data.message === "string" &&
        (data.message.includes("uploads/") || data.message.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf)["']?$/i))
      ) {
        rawPath = data.message;
      } else if (
        typeof data.error === "string" &&
        (data.error.includes("uploads/") || data.error.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf)["']?$/i))
      ) {
        rawPath = data.error;
      }
    }

    const extractedPath = cleanPathString(rawPath);

    // If an upload path was successfully found
    if (extractedPath) {
      let finalUrl = extractedPath;

      // If it's a relative path, convert to full backend URL
      if (
        !finalUrl.startsWith("http://") &&
        !finalUrl.startsWith("https://") &&
        !finalUrl.startsWith("blob:") &&
        !finalUrl.startsWith("data:")
      ) {
        const backendHost = (API_BASE_URL || "").replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
        if (backendHost) {
          const cleanPath = finalUrl.startsWith("/") ? finalUrl.slice(1) : finalUrl;
          finalUrl = `${backendHost}/${cleanPath}`;
        }
      }

      console.log(`[Backend-Upload] ✅ Upload succeeded: "${fileName}" -> ${finalUrl}`);
      return {
        success: true,
        url: finalUrl,
        data: data,
      };
    }

    // If response was not OK and no file path could be extracted
    if (!res.ok) {
      console.error(
        `[Backend-Upload] ❌ Upload rejected (HTTP ${res.status} ${res.statusText}) for "${fileName}" (${fileSizeMB} MB). Backend response:`,
        data
      );

      const errorMsg =
        (data && typeof data === "object" && (data.message || data.error)) ||
        (typeof data === "string" ? cleanPathString(data) : `Upload failed (HTTP ${res.status})`);

      if (typeof errorMsg === "string" && /exceed|too large|size|limit/i.test(errorMsg)) {
        console.error(
          `[Backend-Upload] ⚠️ FILE SIZE LIMIT EXCEEDED: The file "${fileName}" (${fileSizeMB} MB) exceeded the backend server's maximum upload limit. Backend message: "${errorMsg}"`
        );
      }

      return {
        success: false,
        error: errorMsg,
        data: data,
      };
    }

    const fallbackUrl = cleanPathString(
      data?.url || data?.data?.url || data?.fileUrl || (typeof data?.data === "string" ? data.data : undefined)
    );

    return {
      success: true,
      url: fallbackUrl || undefined,
      data: data,
    };
  } catch (e) {
    const elapsed = Date.now() - startTime;
    console.error(`[Backend-Upload] ❌ Exception during upload for "${fileName}" after ${elapsed}ms:`, e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};
