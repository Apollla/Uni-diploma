export const filterDevices = (
  devices: any[],
  statusFilter: string[],
  typeFilter: string[],
  osFilter: string[],
  minPrice: number | "",
  maxPrice: number | "",
  searchText: string,
  searchField: "name" | "model" | "inventoryNumber" | "serialNumber",
  purchaseFrom?: Date | null,
  purchaseTo?: Date | null,
  warrantyFrom?: Date | null,
  warrantyTo?: Date | null,
  warrantyQuickFilter?: "today" | "expired" | "30days" | null
) => {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  return devices.filter(d => {
    const statusMatch = statusFilter.length ? statusFilter.includes(d.status) : true;
    const typeMatch = typeFilter.length ? typeFilter.includes(d.type) : true;
    const osMatch = osFilter.length ? osFilter.includes(d.os) : true;

    const priceMatch =
      (minPrice === "" || d.price >= minPrice) &&
      (maxPrice === "" || d.price <= maxPrice);

    const searchMatch = searchText
      ? String(d[searchField]).toLowerCase().includes(searchText.toLowerCase())
      : true;

    const purchaseDate = d.purchaseDate ? new Date(d.purchaseDate) : null;
    const warrantyDate = d.warrantyUntil ? new Date(d.warrantyUntil) : null;

    const purchaseMatch =
      (!purchaseFrom || (purchaseDate && purchaseDate >= purchaseFrom)) &&
      (!purchaseTo || (purchaseDate && purchaseDate <= purchaseTo));

    const warrantyMatch =
      (!warrantyFrom || (warrantyDate && warrantyDate >= warrantyFrom)) &&
      (!warrantyTo || (warrantyDate && warrantyDate <= warrantyTo));

    // Быстрые фильтры по Warranty
    let quickMatch = true;
    if (warrantyQuickFilter && warrantyDate) {
      if (warrantyQuickFilter === "today") {
        quickMatch =
          warrantyDate.toDateString() === today.toDateString();
      } else if (warrantyQuickFilter === "expired") {
        quickMatch = warrantyDate < today;
      } else if (warrantyQuickFilter === "30days") {
        quickMatch = warrantyDate >= today && warrantyDate <= in30Days;
      }
    }

    return (
      statusMatch &&
      typeMatch &&
      osMatch &&
      priceMatch &&
      searchMatch &&
      purchaseMatch &&
      warrantyMatch &&
      quickMatch
    );
  });
};

