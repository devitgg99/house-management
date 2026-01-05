import { useSession } from "next-auth/react";


const userSession = useSession()
const baseUrl = process.env.API_URL;
export const RegisterService = async () => {
  try {
    const header = userSession.data;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      body:
    });
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