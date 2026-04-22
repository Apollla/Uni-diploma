import { useEffect, useState, useRef } from "react";
import { deviceService } from "../../../services/devices/device.swagger.services";
import { AddDevicePage } from "./AddDevicePage";
import { Plus, Trash2, Eye, Settings, Filter } from "lucide-react";
import { sortDevices } from "../../../services/devices/devise.sorting";
import { filterDevices } from "../../../services/devices/device.filter";
import { DeviceProfilePage } from "./DeviceProfilePage";

export const HardwarePage = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("columns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ["name","type","model","inventoryNumber","status"];
  });

  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [hoverFilter, setHoverFilter] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [osFilter, setOsFilter] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState<"name" | "model" | "inventoryNumber" | "serialNumber">("name");

  const [purchaseFrom, setPurchaseFrom] = useState<Date | null>(null);
  const [purchaseTo, setPurchaseTo] = useState<Date | null>(null);
  const [warrantyFrom, setWarrantyFrom] = useState<Date | null>(null);
  const [warrantyTo, setWarrantyTo] = useState<Date | null>(null);

  const [warrantyQuickFilter, setWarrantyQuickFilter] = useState<"today" | "expired" | "30days" | null>(null);

  const isLocalhost = window.location.hostname === "localhost";

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "model", label: "Model" },
    { key: "inventoryNumber", label: "Inventory Number" },
    { key: "serialNumber", label: "Serial Number" },
    { key: "os", label: "OS" },
    { key: "cpu", label: "CPU" },
    { key: "ram", label: "RAM" },
    { key: "supplier", label: "Supplier" },
    { key: "price", label: "Price" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "warrantyUntil", label: "Warranty" },
    { key: "status", label: "Status" },
    { key: "assignedUserName", label: "User" },
    { key: "notes", label: "Notes" },
  ];

  const requiredColumns = ["name"];

  const loadDevices = async () => {
    try {
      let data = await deviceService.getDevices();
      data = sortDevices(data, sortBy, sortDirection);
      setDevices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [sortBy, sortDirection]);

  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
        setHoverFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async (data: any) => {
    try {
      await deviceService.createDevice(data);
      await loadDevices();
    } catch (e) {
      console.error(e);
      alert("Create error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!isLocalhost) {
        if (!confirm("Delete device?")) return;
      }
      await deviceService.deleteDevice(id);
      await loadDevices();
    } catch (e) {
      console.error(e);
    }
  };

  const openDevicePopup = (id: string) => {
    setSelectedDevice({ id });
  };
  
  useEffect(() => {
    if (selectedDevice) {
      document.body.style.overflow = "hidden"; // блокировка прокрутки
    } else {
      document.body.style.overflow = "";
    }
  
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDevice]);

  const uniqueTypes = Array.from(new Set(devices.map(d => d.type).filter(Boolean)));
  const uniqueOS = Array.from(new Set(devices.map(d => d.os).filter(Boolean)));

  const filteredDevices = filterDevices(
    devices,
    statusFilter,
    typeFilter,
    osFilter,
    minPrice,
    maxPrice,
    searchText,
    searchField,
    purchaseFrom,
    purchaseTo,
    warrantyFrom,
    warrantyTo,
    warrantyQuickFilter
  );

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      {/* Заголовок и кнопки */}
<div className="flex justify-between items-start mb-6">
  <h1 className="text-2xl font-semibold">Hardware</h1>

  <div className="flex flex-col gap-2 items-end">
  <button onClick={() => setIsOpenForm(true)} className="flex items-center justify-center gap-2 w-[180px] bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
    <Plus size={18} /> Add Device
  </button>

  <button onClick={() => console.log("Generate report")} className="flex items-center justify-center gap-2 w-[180px] bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
    Generate Report
  </button>
</div>
</div>

{/* Controls */}
<div className="flex items-center gap-4 mb-4 flex-wrap">

        {/* Search */}
        <div className="flex items-center gap-2"><select className="border p-1 rounded" value={searchField} onChange={(e) => setSearchField(e.target.value as typeof searchField)}>

            <option value="name">Name</option>
            <option value="model">Model</option>
            <option value="inventoryNumber">Inventory Number</option>
            <option value="serialNumber">Serial Number</option>
          </select>
          <input type="text" className="border p-1 rounded" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>

        <span>Sort by:</span>
        <select className="border p-1 rounded" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {allColumns.map(col => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
        </select>

        <select className="border p-1 rounded" value={sortDirection} onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}>
          <option value="asc">↑ Ascending</option>
          <option value="desc">↓ Descending</option>
        </select>

        {/* Warranty Quick Filters */}
        <div className="flex flex-col gap-2 bg-gray-50 border rounded-xl p-3">
  <span className="text-sm font-medium text-gray-600">
    Warranty Quick Filters
  </span>

  <div className="flex gap-2 flex-wrap">
  <button className={`px-3 py-1 rounded ${warrantyQuickFilter === "today" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setWarrantyQuickFilter("today")}>
      Today
    </button>

    <button className={`px-3 py-1 rounded ${warrantyQuickFilter === "expired" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setWarrantyQuickFilter("expired")}>
      Expired
    </button>

    <button className={`px-3 py-1 rounded ${warrantyQuickFilter === "30days"? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setWarrantyQuickFilter("30days")}>
      30 Days
    </button>

    <button className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => setWarrantyQuickFilter(null)}>
      Clear
    </button>
  </div>
</div>

        {/* Filter Button */}
        <div className="relative" ref={filterRef}>
        <button onClick={() => setIsFilterMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100">
  <Filter size={16} /> Filters
</button>
          {isFilterMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-2 z-50">
              <div className="flex flex-col gap-1">
                {["Status", "Type", "OS", "Price", "Purchase", "Warranty"].map(filter => (
                  <div key={filter} className="relative p-1 hover:bg-gray-100 rounded cursor-pointer" onMouseEnter={() => setHoverFilter(filter)} onMouseLeave={() => setHoverFilter(null)}>
                    {filter}
                    {hoverFilter === filter && (
                      <div className="absolute left-full top-0 w-56 bg-white border rounded-xl shadow-lg p-2 z-50">
                        {filter === "Status" && ["Available", "In Use", "In Repair"].map(s => (
                          <label key={s} className="flex items-center gap-2 text-sm mb-1">
                            <input type="checkbox" checked={statusFilter.includes(s)}
                              onChange={() => {
                                setStatusFilter(prev =>
                                  prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                                );
                              }}/>
                            {s}
                          </label>
                        ))}
                        {filter === "Type" && uniqueTypes.map(t => (
                          <label key={t} className="flex items-center gap-2 text-sm mb-1">
                            <input type="checkbox" checked={typeFilter.includes(t)} onChange={() => {
                                setTypeFilter(prev =>
                                  prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                                );
                              }}
                            />
                            {t}
                          </label>
                        ))}
                        {filter === "OS" && uniqueOS.map(o => (
                          <label key={o} className="flex items-center gap-2 text-sm mb-1">
                            <input type="checkbox" checked={osFilter.includes(o)} onChange={() => {
                                setOsFilter(prev =>
                                  prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
                              }}/>
                            {o}
                          </label>
                        ))}
                        {filter === "Price" && (
                          <div className="flex flex-col gap-2">
                            <label className="flex justify-between text-sm">
                              <span>From:</span>
                              <input type="number" className="border p-1 rounded w-24" value={minPrice} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                            </label>
                            <label className="flex justify-between text-sm">
                              <span>To:</span>
                              <input type="number" className="border p-1 rounded w-24" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                            </label>
                          </div>
                        )}
                        {filter === "Purchase" && (
                          <div className="flex flex-col gap-2">
                            <label className="flex justify-between text-sm">
                              <span>From:</span>
                              <input type="date" className="border p-1 rounded w-36" value={purchaseFrom ? purchaseFrom.toISOString().split("T")[0] : ""} onChange={e => setPurchaseFrom(e.target.value ? new Date(e.target.value) : null)}/>
                            </label>
                            <label className="flex justify-between text-sm">
                              <span>To:</span>
                              <input type="date" className="border p-1 rounded w-36" value={purchaseTo ? purchaseTo.toISOString().split("T")[0] : ""} onChange={e => setPurchaseTo(e.target.value ? new Date(e.target.value) : null)}/>
                            </label>
                          </div>
                        )}
                        {filter === "Warranty" && (
                          <div className="flex flex-col gap-2">
                            <label className="flex justify-between text-sm">
                              <span>From:</span>
                              <input type="date"className="border p-1 rounded w-36" value={warrantyFrom ? warrantyFrom.toISOString().split("T")[0] : ""} onChange={e => setWarrantyFrom(e.target.value ? new Date(e.target.value) : null)}/>
                            </label>
                            <label className="flex justify-between text-sm">
                              <span>To:</span>
                              <input type="date"className="border p-1 rounded w-36" value={warrantyTo ? warrantyTo.toISOString().split("T")[0] : ""} onChange={e => setWarrantyTo(e.target.value ? new Date(e.target.value) : null)}/>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={() => {
                    setStatusFilter([]);
                    setTypeFilter([]);
                    setOsFilter([]);
                    setMinPrice("");
                    setMaxPrice("");
                    setPurchaseFrom(null);
                    setPurchaseTo(null);
                    setWarrantyFrom(null);
                    setWarrantyTo(null);
                    setWarrantyQuickFilter(null);
                  }}
                  className="mt-2 w-full text-center bg-red-100 hover:bg-red-200 text-red-700 rounded-lg p-1 text-sm font-medium">
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column Settings */}
        <div className="relative" ref={menuRef}>
        <button onClick={() => setIsColumnMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100">
  <Settings size={18} />
  Columns
</button>


          {isColumnMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 z-50">
              <p className="font-medium mb-2">Columns</p>

              {allColumns.map(col => (
                <label key={col.key} className="flex gap-2 text-sm">
                  <input type="checkbox" checked={visibleColumns.includes(col.key)} disabled={requiredColumns.includes(col.key)} onChange={() => {
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

      <AddDevicePage isOpen={isOpenForm} onClose={() => setIsOpenForm(false)} onCreate={handleAdd}/>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm">
  <div className="overflow-x-auto">
    <table className="min-w-[1000px] w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-r w-[90px]">№</th>
              {allColumns.filter(col => visibleColumns.includes(col.key)).map(col => (
                <th key={col.key} className="p-3 border-r">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((d, index) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-3 border-r flex justify-between items-center">
                  <span>{index + 1}</span>
                  <div className="flex flex-col ml-2 gap-1">
                    <button onClick={() => openDevicePopup(d.id)} className="text-blue-500 hover:text-blue-700">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                {allColumns.filter(col => visibleColumns.includes(col.key)).map(col => {
  let value = d[col.key];
  let cellClass = "p-3 border-r truncate";

  if (col.key === "purchaseDate" || col.key === "warrantyUntil") {
    value = value ? new Date(value).toLocaleDateString() : "-";

    if (col.key === "warrantyUntil" && d.warrantyUntil) {
      const today = new Date();
      const warrantyDate = new Date(d.warrantyUntil);
      const diffDays = (warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (warrantyDate < today) {
        cellClass += " bg-red-100";
      } else if (diffDays <= 30) {
        cellClass += " bg-yellow-100";
      }
    }
  }

  return <td key={col.key} className={cellClass}>{value ?? "-"}</td>;
})}

              </tr>
            ))}
            {!filteredDevices.length && (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="p-4 text-center text-gray-500">
                  No devices
                </td>
              </tr>
            )}
          </tbody>
          </table>
</div>
</div>
      {/* Device Popup */}
      {selectedDevice && (
  <DeviceProfilePage deviceId={selectedDevice.id} onClose={() => setSelectedDevice(null)}/>
)}
    </div>
  );
};
