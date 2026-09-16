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
  try {
    console.log("📤 Uploading file...");

    const res = await fetch(`${API_BASE_URL}/file/upload`, {
      method: "POST",
      body: formData,
    });

    let data: any;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log("📥 Upload response:", res.status, data);

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

      return {
        success: true,
        url: finalUrl,
        data: data,
      };
    }

    // If response was not OK and no file path could be extracted
    if (!res.ok) {
      return {
        success: false,
        error:
          (data && typeof data === "object" && (data.message || data.error)) ||
          (typeof data === "string" ? cleanPathString(data) : `Upload failed (${res.status})`),
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
    console.error("❌ Upload error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};
