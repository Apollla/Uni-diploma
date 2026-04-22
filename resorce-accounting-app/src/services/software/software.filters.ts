export const filterSoftwares = (
  softwares: any[],
  licenseFilter: string[],
  vendorFilter: string[],
  minPrice: number | "",
  maxPrice: number | "",
  searchText: string,
  searchField: "name" | "version" | "vendor",
  purchaseFrom?: Date | null,
  purchaseTo?: Date | null,
  expirationFrom?: Date | null,
  expirationTo?: Date | null,
  expirationQuickFilter?: "today" | "expired" | "30days" | null
) => {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  return softwares.filter(s => {
    const licenseMatch = licenseFilter.length
      ? licenseFilter.includes(s.licenseType)
      : true;

    const vendorMatch = vendorFilter.length
      ? vendorFilter.includes(s.vendor)
      : true;

    const priceMatch =
      (minPrice === "" || s.price >= minPrice) &&
      (maxPrice === "" || s.price <= maxPrice);

    const searchMatch = searchText
      ? String(s[searchField] || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      : true;

    const purchaseDate = s.purchaseDate ? new Date(s.purchaseDate) : null;
    const expirationDate = s.expirationDate
      ? new Date(s.expirationDate)
      : null;

    const purchaseMatch =
      (!purchaseFrom || (purchaseDate && purchaseDate >= purchaseFrom)) &&
      (!purchaseTo || (purchaseDate && purchaseDate <= purchaseTo));

    const expirationMatch =
      (!expirationFrom || (expirationDate && expirationDate >= expirationFrom)) &&
      (!expirationTo || (expirationDate && expirationDate <= expirationTo));

    let quickMatch = true;

    if (expirationQuickFilter && expirationDate) {
      if (expirationQuickFilter === "today") {
        quickMatch =
          expirationDate.toDateString() === today.toDateString();
      } else if (expirationQuickFilter === "expired") {
        quickMatch = expirationDate < today;
      } else if (expirationQuickFilter === "30days") {
        quickMatch =
          expirationDate >= today && expirationDate <= in30Days;
      }
    }

    return (
      licenseMatch &&
      vendorMatch &&
      priceMatch &&
      searchMatch &&
      purchaseMatch &&
      expirationMatch &&
      quickMatch
    );
  });
};
