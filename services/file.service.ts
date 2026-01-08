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

    const data = await res.json();
    console.log("📥 Upload response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Upload failed",
      };
    }

    return {
      success: true,
      url: data.url || data.data?.url || data.fileUrl || data.data,
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
