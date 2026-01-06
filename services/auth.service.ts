const baseUrl = process.env.API_URL || "http://localhost:8080/api/v1";

export const RegisterService = async (data: Record<string, unknown>) => {
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    const result = JSON.parse(text);
    return result;
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
