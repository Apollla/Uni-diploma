export const filterUsers = (
  users: any[],
  departmentFilter: string[],
  positionFilter: string[],
  searchText: string,
  searchField: "name" | "email" | "department"
) => {
  return users.filter(u => {
    const departmentMatch = departmentFilter.length
      ? departmentFilter.includes(u.department)
      : true;

    const positionMatch = positionFilter.length
      ? positionFilter.includes(u.position)
      : true;

    const searchMatch = searchText
      ? String(u[searchField] || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      : true;

    return departmentMatch && positionMatch && searchMatch;
  });
};
