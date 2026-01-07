"use server";

import { RegisterService } from "@/services/auth.service";
import { RegisterRequest } from "@/types/auth/Register";

export const registerAction = async (registerData: RegisterRequest) => {
  const response = await RegisterService(registerData);
  return response;
};