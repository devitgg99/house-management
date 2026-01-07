"use server";

import { UploadFileService, FileUploadResponse } from "@/services/file.service";

export const UploadFileAction = async (formData: FormData): Promise<FileUploadResponse> => {
  const file = formData.get("file") as File;
  
  if (!file) {
    return {
      success: false,
      error: "No file provided",
    };
  }

  const response = await UploadFileService(file);
  return response;
};

