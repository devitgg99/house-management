"use server";

import { RegisterService } from "@/services/auth.service";
import { RegisterRequest } from "@/types/auth/Register";

export const RegisterAction = async (registerData: RegisterRequest) => {
  const response = await RegisterService(registerData);
  return response;
};
