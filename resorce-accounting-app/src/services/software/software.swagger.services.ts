const BASE_URL = "https://unibe-lilac.vercel.app";

export const softwareService = {
  async getSoftwares() {
    const res = await fetch(`${BASE_URL}/softwares`);
    if (!res.ok) throw new Error("Failed to fetch softwares");
    return res.json();
  },

  async getSoftwareById(id: string) {
    const res = await fetch(`${BASE_URL}/softwares/${id}`);
    if (!res.ok) throw new Error("Failed to fetch software");
    return res.json();
  },

  async createSoftware(data: any) {
    const res = await fetch(`${BASE_URL}/softwares`, {
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

  async deleteSoftware(id: string) {
    const res = await fetch(`${BASE_URL}/softwares/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
  },

  async patchSoftware(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/softwares/${id}`, {
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
