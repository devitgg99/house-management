import { RegisterService } from "@/services/auth.service";
import { RegisterRequest } from "@/types/auth/Register";

export const registerAction = async (registerData: RegisterRequest) => {
  const response = await RegisterService(registerData);

  // Check if the error indicates the user already exists
  if (!response.success && typeof response.error === "string" && response.error.toLowerCase().includes("already exists")) {
    return {
      success: false,
      error: response.error,
      existingUser: true, // Flag to indicate user exists
    };
  }

  return response;
};