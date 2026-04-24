const API_URL = "https://unibe-lilac.vercel.app";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

// SIGN IN (POST /auth/signin)
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Sign in failed");
  }

  return data;
};
