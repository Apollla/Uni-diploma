import softwares from "../api/softwares.json";

export const softwareService = {
  // Получить все ПО
  getSoftwares() {
    return softwares;
  },

  // Получить ПО по id
  getSoftwareById(id: string) {
    return softwares.find(s => s.id === id);
  },

  // Пользователи ПО
  getSoftwareUsers(id: string) {
    const software = softwares.find(s => s.id === id);
    return software?.users || [];
  },

  // Устройства с ПО
  getSoftwareDevices(id: string) {
    const software = softwares.find(s => s.id === id);
    return software?.devices || [];
  },

  // 📊 Статистика
  getStats() {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    // Всего лицензий (мест)
    const totalLicenses = softwares.reduce(
      (acc, s) => acc + (s.totalLicenses || 0),
      0
    );

    // Истекающие лицензии (именно КОЛИЧЕСТВО МЕСТ)
    const expiringLicenses = softwares.reduce((acc, s) => {
      const date = new Date(s.expirationDate);
      if (date >= now && date <= in30Days) {
        return acc + (s.totalLicenses || 0);
      }
      return acc;
    }, 0);

    // Всего продуктов
    const totalProducts = softwares.length;

    // Уникальные вендоры
    const vendors = new Set(
      softwares.map(s => s.vendor).filter(Boolean)
    ).size;

    // Подписки
    const activeSubscriptions = softwares.filter(
      s => s.licenseType?.toLowerCase() === "subscription"
    ).length;

    // Бессрочные лицензии
    const perpetualLicenses = softwares.filter(
      s => s.licenseType?.toLowerCase() === "perpetual"
    ).length;

    return {
      totalLicenses,
      expiringLicenses,
      totalProducts,
      vendors,
      activeSubscriptions,
      perpetualLicenses,
    };
  },
};


