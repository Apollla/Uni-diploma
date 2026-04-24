export const getTotalExpenses = (
  hardwareCost: number,
  softwareCost: number,
  repairCost: number
) => {
  return hardwareCost + softwareCost + repairCost;
};

export const getSoftwareExpenses = (softwares: any[]) => {
  return softwares.reduce((sum, s) => sum + (s.price || 0), 0);
};

export const getHardwareExpenses = (devices: any[]) => {
  return devices.reduce((sum, d) => sum + (d.price || 0), 0);
};

export const getUnusedLicensesPercent = (softwares: any[]) => {
  const total = softwares.reduce((sum, s) => sum + (s.totalLicenses || 0), 0);
  const used = softwares.reduce((sum, s) => sum + (s.usedLicenses || 0), 0);

  if (!total) return 0;

  return Math.round(((total - used) / total) * 100);
};

export const getDevicesUsagePercent = (devices: any[]) => {
  const total = devices.length;
  const used = devices.filter(d => d.status === "In Use").length;

  if (!total) return 0;

  return Math.round((used / total) * 100);
};

export const getDevicesInRepairPercent = (devices: any[]) => {
  const total = devices.length;
  const inRepair = devices.filter(d => d.status === "In Repair").length;

  if (!total) return 0;

  return Math.round((inRepair / total) * 100);
};

// ПО по месяцам
export const getSoftwareExpensesByMonth = (softwares: any[]) => {
  const map: Record<string, number> = {};

  softwares.forEach(s => {
    if (!s.purchaseDate) return;

    const date = new Date(s.purchaseDate);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    map[key] = (map[key] || 0) + (s.price || 0);
  });

  return Object.entries(map).map(([month, value]) => ({
    month,
    value,
  }));
};

// оборудование по месяцам
export const getHardwareExpensesByMonth = (devices: any[]) => {
  const map: Record<string, number> = {};

  devices.forEach(d => {
    if (!d.purchaseDate) return;

    const date = new Date(d.purchaseDate);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    map[key] = (map[key] || 0) + (d.price || 0);
  });

  return Object.entries(map).map(([month, value]) => ({
    month,
    value,
  }));
};

// рост активов
export const getAssetsGrowth = (devices: any[]) => {
  const map: Record<string, number> = {};

  devices.forEach(d => {
    if (!d.purchaseDate) return;

    const date = new Date(d.purchaseDate);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, count]) => ({
      month,
      value: count,
    }));
};

// software expenses by license type (subscription vs perpetual)
export const getSoftwareExpensesByLicenseType = (softwares: any[]) => {
  const map: Record<string, number> = {
    subscription: 0,
    perpetual: 0,
    other: 0,
  };

  softwares.forEach((s) => {
    const type = (s.licenseType || "other").toLowerCase();

    const totalCost =
      Number(s.price || 0) * Number(s.totalLicenses || 0);

    if (map[type] !== undefined) {
      map[type] += totalCost;
    } else {
      map["other"] += totalCost;
    }
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
};

export const getSoftwareUsageStats = (softwares: any[]) => {
  if (!Array.isArray(softwares)) return [];

  return softwares
    .map((s: any) => {
      const total = Number(s.totalLicenses || 0);
      const assigned =
        s.users?.length ||
        s.assignedUsers?.length ||
        0;

      return {
        name: s.name || "Unknown",
        total,
        assigned,
        unused: total - assigned,
      };
    })
    // только где есть лицензии и есть потери
    .filter((s) => s.total > 0 && s.unused > 0)
    // сортировка по неиспользуемым
    .sort((a, b) => b.unused - a.unused)
    // топ 8
    .slice(0, 8);
};


export const getSoftwareSubscriptionHeatmap = (softwares: any[]) => {
  const months: Record<string, number> = {};

  const now = new Date();

  //13 месяцев вперёд
  for (let i = 0; i < 13; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = 0;
  }

  softwares.forEach((s) => {
    if ((s.licenseType || "").toLowerCase().trim() !== "subscription") return;
    if (!s.expirationDate) return;

    const date = new Date(s.expirationDate);
    if (isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const cost =
      Number(s.price || 0) * Number(s.totalLicenses || 1);

    if (months[key] !== undefined) {
      months[key] += cost;
    }
  });

  return Object.entries(months).map(([month, value]) => ({
    month,
    value,
  }));
};
