const BASE_URL = "https://unibe-lilac.vercel.app";

export const deviceService = {
  async getDevices() {
    const res = await fetch(`${BASE_URL}/devices`);
    if (!res.ok) throw new Error("Failed to fetch devices");
    return res.json();
  },

  async getDeviceById(id: string) {
    const res = await fetch(`${BASE_URL}/devices/${id}`);
    if (!res.ok) throw new Error("Failed to fetch device");
    return res.json();
  },

  async createDevice(data: any) {
    const res = await fetch(`${BASE_URL}/devices`, {
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

  async deleteDevice(id: string) {
    const res = await fetch(`${BASE_URL}/devices/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
  },

  async patchDevice(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
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
