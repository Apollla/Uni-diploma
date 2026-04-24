const API_URL = "https://unibe-lilac.vercel.app";

export const signUp = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  console.log("STATUS:", res.status);
  console.log("RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data?.message || "Sign up failed");
  }

  return data;
};