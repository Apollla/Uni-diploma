import devices from "../api/devices.json";

export const deviceService = {
  // Получить все устройства
  getDevices() {
    return devices;
  },

  // Получить устройство по id
  getDeviceById(id: string) {
    return devices.find(d => d.id === id);
  },

  // Получить ПО устройства
  getDeviceSoftwares(deviceId: string) {
    const device = devices.find(d => d.id === deviceId);
    return device?.softwares || [];
  },

  // Получить историю устройства
  getDeviceHistory(deviceId: string) {
    const device = devices.find(d => d.id === deviceId);
    return device?.history || [];
  },

  // Статистика для dashboard
  getStats() {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const total = devices.length;

    const inUse = devices.filter(d => d.status === "In Use").length;

    const available = devices.filter(d => d.status === "Available").length;

    const inRepair = devices.filter(d => d.status === "In Repair").length;

    const expiringWarranty = devices.filter(d => {
      const date = new Date(d.warrantyUntil);
      return date >= now && date <= in30Days;
    }).length;

    const suppliers = new Set(
      devices.map(d => d.supplier).filter(Boolean)
    ).size;

    return {
      total,
      inUse,
      available,
      inRepair,
      expiringWarranty,
      suppliers,
    };
  },
};

