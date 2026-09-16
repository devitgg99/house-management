const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type FileUploadResponse = {
  success: boolean;
  url?: string;
  error?: string;
  data?: any;
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
    let extractedPath: string | undefined;

    if (typeof data === "string") {
      extractedPath = data;
    } else if (data && typeof data === "object") {
      // Check explicit URL/path fields first
      if (typeof data.url === "string") extractedPath = data.url;
      else if (typeof data.data?.url === "string") extractedPath = data.data.url;
      else if (typeof data.fileUrl === "string") extractedPath = data.fileUrl;
      else if (typeof data.filePath === "string") extractedPath = data.filePath;
      else if (typeof data.path === "string") extractedPath = data.path;
      else if (typeof data.data === "string") extractedPath = data.data;
      else if (typeof data.fileName === "string") extractedPath = data.fileName;
      else if (typeof data.filename === "string") extractedPath = data.filename;
      // Check message or error fields if they contain a valid file/upload path
      else if (
        typeof data.message === "string" &&
        (data.message.includes("uploads/") || data.message.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i))
      ) {
        extractedPath = data.message;
      } else if (
        typeof data.error === "string" &&
        (data.error.includes("uploads/") || data.error.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i))
      ) {
        extractedPath = data.error;
      }
    }

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
          (typeof data === "string" ? data : `Upload failed (${res.status})`),
      };
    }

    return {
      success: true,
      url: data?.url || data?.data?.url || data?.fileUrl || (typeof data?.data === "string" ? data.data : undefined),
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
