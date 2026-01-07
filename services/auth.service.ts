import { RegisterRequest } from "@/types/auth/Register";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const RegisterService = async (registerRequest: RegisterRequest) => {
  try {
    console.log("📤 Register request:", JSON.stringify(registerRequest, null, 2));
    
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerRequest),
    });

    const data = await res.json();
    console.log("📥 Register response:", res.status, JSON.stringify(data, null, 2));

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || `Registration failed (${res.status})`,
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Register error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};