const BASE_URL = "https://unibe-lilac.vercel.app";

export const userService = {
  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async getUserById(id: string) {
    const res = await fetch(`${BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  async createUser(data: any) {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("SERVER ERROR:", text);
      throw new Error("Create failed");
    }

    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
  },

  async patchUser(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("SERVER ERROR:", text);
      throw new Error("Patch failed");
    }

    return res.json();
  },
};
