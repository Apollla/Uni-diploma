// utils/sortDevices.ts

export const sortDevices = (
  data: any[],
  key: string,
  direction: "asc" | "desc" = "desc"
): any[] => {
  return [...data].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    // Сортировка по дате
    if (key === "purchaseDate" || key === "warrantyUntil") {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    }

    // Числовая сортировка
    if (typeof valA === "number" && typeof valB === "number") {
      return direction === "asc" ? valA - valB : valB - valA;
    }

    // Строковая сортировка
    valA = valA ? String(valA).toLowerCase() : "";
    valB = valB ? String(valB).toLowerCase() : "";

    return direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });
};
