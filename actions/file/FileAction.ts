"use server";

import { UploadFileService, FileUploadResponse } from "@/services/file.service";

export const UploadFileAction = async (formData: FormData): Promise<FileUploadResponse> => {
  const file = formData.get("file") as File | null;
  const fileName = file?.name || "unnamed";
  const fileSizeMB = file?.size ? (file.size / (1024 * 1024)).toFixed(2) : "0";

  console.log(`[ServerAction:UploadFileAction] 📥 Received upload request: "${fileName}" (${fileSizeMB} MB)`);
  const response = await UploadFileService(formData);

  if (!response.success) {
    console.error(`[ServerAction:UploadFileAction] ❌ Upload failed for "${fileName}":`, response.error);
  } else {
    console.log(`[ServerAction:UploadFileAction] ✅ Upload success for "${fileName}" -> URL:`, response.url);
  }

  return response;
};
