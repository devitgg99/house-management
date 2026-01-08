"use server";

import { UploadFileService, FileUploadResponse } from "@/services/file.service";

export const UploadFileAction = async (formData: FormData): Promise<FileUploadResponse> => {
  const response = await UploadFileService(formData);
  return response;
};
