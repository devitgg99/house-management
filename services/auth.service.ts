import { RegisterRequest } from "@/types/auth/Register";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const RegisterService = async (registerRequest : RegisterRequest) => {
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerRequest),
  });
  console.log("res",res)
    const text = await res.text();
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Network error or server is unreachable",
    };
  }
};