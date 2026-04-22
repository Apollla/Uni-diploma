import { useEffect, useState, useRef } from "react";
import { userService } from "../../../services/user/user.swagger.services";
import { AddUserPage } from "../../pages/user/AddUserPage";
import { UserProfilePage } from "../../pages/user/UserProfilePage";
import { Plus, Trash2, Eye, Settings, Filter } from "lucide-react";
import { filterUsers } from "../../../services/user/user.filters";

export const UserPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);


  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("userColumns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ["name", "email", "position", "department"];
  });

  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [positionFilter, setPositionFilter] = useState<string[]>([]);

  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState<"name" | "email" | "department">("name");
  const [hoverFilter, setHoverFilter] = useState<string | null>(null);


  const allColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "position", label: "Position" },
    { key: "department", label: "Department" },
    { key: "devicesCount", label: "Devices" },
    { key: "licensesCount", label: "Licenses" },
  ];

  const requiredColumns = ["name"];

  // SORT
  const sortUsers = (data: any[]) => {
    return [...data].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  };

  const loadUsers = async () => {
    try {
      let data = await userService.getUsers();
      data = sortUsers(data);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [sortBy, sortDirection]);

  useEffect(() => {
    localStorage.setItem("userColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async (data: any) => {
    try {
      await userService.createUser(data);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert("Create error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      await loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const openUserPopup = (id: string) => {
    setSelectedUserId(id);
  };
  

  if (loading) return <p className="p-6">Loading...</p>;

  const uniqueDepartments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));
  const uniquePositions = Array.from(new Set(users.map(u => u.position).filter(Boolean)));

  const filteredUsers = filterUsers(
    users,
    departmentFilter,
    positionFilter,
    searchText,
    searchField
  );  

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>

        <div className="flex flex-col gap-2 items-end">
          <button onClick={() => setIsOpenForm(true)} className="flex items-center justify-center gap-2 w-[180px] bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" >
            <Plus size={18} /> Add User
          </button>

          <button onClick={() => console.log("Generate report")} className="flex items-center justify-center gap-2 w-[180px] bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Generate Report
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">

        {/* Search */}
        <div className="flex items-center gap-2">
        <select className="border p-1 rounded" value={searchField} onChange={(e) => setSearchField(e.target.value as any)}>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="department">Department</option>
          </select>

          <input type="text" className="border p-1 rounded" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>

        {/* SORT */}
        <span>Sort by:</span>

        <select className="border p-1 rounded" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {allColumns.map(col => (
            <option key={col.key} value={col.key}>
              {col.label}
            </option>
          ))}
        </select>

        <select className="border p-1 rounded" value={sortDirection} onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}>
          <option value="asc">↑ Ascending</option>
          <option value="desc">↓ Descending</option>
        </select>

        {/* Filters */}
        <div className="relative" ref={filterRef}>
          <button onClick={() => setIsFilterMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100" >
            <Filter size={16} /> Filters
          </button>

          {isFilterMenuOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-2 z-50 overflow-visible">
    
    <div className="flex flex-col gap-1">

      {["Department", "Position"].map(filter => (
        <div key={filter} className="relative p-1 hover:bg-gray-100 rounded cursor-pointer" onMouseEnter={() => setHoverFilter(filter)} onMouseLeave={() => setHoverFilter(null)}>
          {filter}

          {hoverFilter === filter && (
            <div className="absolute left-full top-0 w-56 bg-white border rounded-xl shadow-lg p-2 z-50">

              {/* Department */}
              {filter === "Department" &&
                uniqueDepartments.map(d => (
                  <label key={d} className="flex items-center gap-2 text-sm mb-1">
                    <input type="checkbox"
                      checked={departmentFilter.includes(d)}
                      onChange={() => {
                        setDepartmentFilter(prev =>
                          prev.includes(d)
                            ? prev.filter(x => x !== d)
                            : [...prev, d]
                        );
                      }}/>
                    {d}
                  </label>
                ))}

              {/* Position */}
              {filter === "Position" &&
                uniquePositions.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm mb-1">
                    <input type="checkbox"
                      checked={positionFilter.includes(p)}
                      onChange={() => {
                        setPositionFilter(prev =>
                          prev.includes(p)
                            ? prev.filter(x => x !== p)
                            : [...prev, p]
                        );
                      }}/>
                    {p}
                  </label>
                ))}

            </div>
          )}
        </div>
      ))}

      <button onClick={() => {setDepartmentFilter([]); setPositionFilter([]);}}
        className="mt-2 w-full text-center bg-red-100 hover:bg-red-200 text-red-700 rounded-lg p-1 text-sm font-medium">
        Clear All Filters
      </button>

    </div>
  </div>
)}
</div>

        {/* Columns */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsColumnMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100" >
            <Settings size={18} /> Columns
          </button>

          {isColumnMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg p-3 z-50">
              {allColumns.map(col => (
                <label key={col.key} className="flex gap-2 text-sm">
                  <input type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    disabled={requiredColumns.includes(col.key)}
                    onChange={() => {
                      setVisibleColumns(prev =>
                        prev.includes(col.key)
                          ? prev.filter(c => c !== col.key)
                          : [...prev, col.key]
                      );
                    }}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddUserPage isOpen={isOpenForm} onClose={() => setIsOpenForm(false)} onCreate={handleAdd} />

       {/*TABLE*/}
       <div className="bg-white rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-r w-[90px]">№</th>
                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <th key={col.key} className="p-3 border-r whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u, index) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">

                  <td className="p-3 border-r flex justify-between items-center">
                    <span>{index + 1}</span>

                    <div className="flex flex-col ml-2 gap-1">
                      <button onClick={() => openUserPopup(u.id)} className="text-blue-500">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                  {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                    <td key={col.key} className="p-3 border-r whitespace-nowrap">
                      {u[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}

              {!filteredUsers.length && (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="text-center p-4 text-gray-500">
                    No users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUserId && (
        <UserProfilePage userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={loadUsers} />
      )}
    </div>
  );
};