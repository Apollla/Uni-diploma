import { useEffect, useState, useRef } from "react";
import { softwareService } from "../../../services/software/software.swagger.services"
import { AddSoftwarePage } from "../../pages/software/AddSoftwarePage";
import { SoftwareProfilePage } from "../software/SoftwareProfilePage";
import { Plus, Trash2, Eye, Settings, Filter } from "lucide-react";
import { filterSoftwares } from "../../../services/software/software.filters";
import { sortSoftwares } from "../../../services/software/software.sorting";


export const SoftwarePage = () => {
  const [softwares, setSoftwares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string | null>(null);


  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("softwareColumns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ["name", "version", "licenseType", "totalLicenses", "vendor"];
  });

  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [hoverFilter, setHoverFilter] = useState<string | null>(null);
  const [purchaseFrom, setPurchaseFrom] = useState<Date | null>(null);
const [purchaseTo, setPurchaseTo] = useState<Date | null>(null);

const [expirationFrom, setExpirationFrom] = useState<Date | null>(null);
const [expirationTo, setExpirationTo] = useState<Date | null>(null);

const [expirationQuickFilter, setExpirationQuickFilter] = useState<
  "today" | "expired" | "30days" | null
>(null);


  const [licenseFilter, setLicenseFilter] = useState<string[]>([]);
  const [vendorFilter, setVendorFilter] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState<"name" | "version" | "vendor">("name");

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "version", label: "Version" },
    { key: "licenseType", label: "License Type" },
    { key: "totalLicenses", label: "Total Licenses" },
    { key: "price", label: "Price" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "expirationDate", label: "Expiration Date" },
    { key: "vendor", label: "Vendor" },
    { key: "notes", label: "Notes" },
  ];
  const requiredColumns = ["name"];

  const loadSoftwares = async () => {
    try {
      let data = await softwareService.getSoftwares();
      // сортировка, если нужен аналог sortDevices
      data = sortSoftwares(data, sortBy, sortDirection);
setSoftwares(data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSoftwares();
  }, [sortBy, sortDirection]);

  useEffect(() => {
    localStorage.setItem("softwareColumns", JSON.stringify(visibleColumns));
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
      await softwareService.createSoftware(data);
      await loadSoftwares();
    } catch (e) {
      console.error(e);
      alert("Create error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      
      await softwareService.deleteSoftware(id);
      await loadSoftwares();
    } catch (e) {
      console.error(e);
    }
  };

  const openSoftwarePopup = (id: string) => {
    setSelectedSoftwareId(id);
  };

  const closeSoftwarePopup = () => {
    setSelectedSoftwareId(null);
    loadSoftwares();
  };  
  

  if (loading) return <p className="p-6">Loading...</p>;

  const uniqueLicenseTypes = Array.from(new Set(softwares.map(s => s.licenseType).filter(Boolean)));
  const uniqueVendors = Array.from(new Set(softwares.map(s => s.vendor).filter(Boolean)));

  // фильтрация аналогично filterDevices
  

const filteredSoftwares = filterSoftwares(
  softwares,
  licenseFilter,
  vendorFilter,
  minPrice,
  maxPrice,
  searchText,
  searchField,
  purchaseFrom,
purchaseTo,
expirationFrom,
expirationTo,
expirationQuickFilter

);


  return (
    <div className="p-6">
      {/* Header and Buttons */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold">Software</h1>
        <div className="flex flex-col gap-2 items-end">
          <button onClick={() => setIsOpenForm(true)} className="flex items-center justify-center gap-2 w-[180px] bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus size={18} /> Add Software
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
          <select
            className="border p-1 rounded"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as typeof searchField)}>
            <option value="name">Name</option>
            <option value="version">Version</option>
            <option value="vendor">Vendor</option>
          </select>
          <input type="text" className="border p-1 rounded" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>

        <span>Sort by:</span>
        <select className="border p-1 rounded" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {allColumns.map(col => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
        </select>
        <select className="border p-1 rounded"
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}>
          <option value="asc">↑ Ascending</option>
          <option value="desc">↓ Descending</option>
        </select>


        <div className="flex flex-col gap-2 bg-gray-50 border rounded-xl p-3">
  <span className="text-sm font-medium text-gray-600">
    Expiration Quick Filters
  </span>

  <div className="flex gap-2 flex-wrap">
  <button className={`px-3 py-1 rounded ${expirationQuickFilter === "today" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setExpirationQuickFilter("today")}>Today</button>

    <button className={`px-3 py-1 rounded ${expirationQuickFilter === "expired" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setExpirationQuickFilter("expired")}>Expired</button>
<button className={`px-3 py-1 rounded ${expirationQuickFilter === "30days" ? "bg-blue-500 text-white" : "bg-gray-100"}`} onClick={() => setExpirationQuickFilter("30days")}>30 Days</button>

    <button className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => setExpirationQuickFilter(null)}>
      Clear
    </button>
  </div>
</div>

        {/* Filters Button */}
        <div className="relative" ref={filterRef}>
          <button onClick={() => setIsFilterMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100">
            <Filter size={16} /> Filters
          </button>
          {isFilterMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-2 z-50">
              <div className="flex flex-col gap-1">
                {["License Type", "Vendor", "Price", "Purchase", "Expiration"].map(filter => (
                 <div key={filter} className="relative p-1 hover:bg-gray-100 rounded cursor-pointer" onMouseEnter={() => setHoverFilter(filter)} onMouseLeave={() => setHoverFilter(null)}>
                  {filter}
                
                  {hoverFilter === filter && (
                    <div className="absolute left-full top-0 w-56 bg-white border rounded-xl shadow-lg p-2 z-50">
                
                      {/* License */}
                      {filter === "License Type" &&
                        uniqueLicenseTypes.map(l => (
                          <label key={l} className="flex items-center gap-2 text-sm mb-1">
                            <input type="checkbox" checked={licenseFilter.includes(l)} onChange={() => setLicenseFilter(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])} />
                            {l}
                          </label>
                        ))}
                
                      {/* Vendor */}
                      {filter === "Vendor" &&
                        uniqueVendors.map(v => (
                          <label key={v} className="flex items-center gap-2 text-sm mb-1">
                            <input type="checkbox" checked={vendorFilter.includes(v)} onChange={() => setVendorFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} />
                            {v}
                          </label>
                        ))}
                
                      {/* Price */}
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
                
                      {/* Purchase */}
                      {filter === "Purchase" && (
                        <div className="flex flex-col gap-2">
                          <label className="flex justify-between text-sm">
                            <span>From:</span>
                            <input type="date" className="border p-1 rounded w-36" value={purchaseFrom ? purchaseFrom.toISOString().split("T")[0] : ""} onChange={e => setPurchaseFrom(e.target.value ? new Date(e.target.value) : null)} />
                          </label>
                          <label className="flex justify-between text-sm">
                            <span>To:</span>
                            <input type="date" className="border p-1 rounded w-36"
                              value={purchaseTo ? purchaseTo.toISOString().split("T")[0] : ""}
                              onChange={e => setPurchaseTo(e.target.value ? new Date(e.target.value) : null)}/>
                          </label>
                        </div>
                      )}
                
                      {/* Expiration */}
                      {filter === "Expiration" && (
                        <div className="flex flex-col gap-2">
                          <label className="flex justify-between text-sm">
                            <span>From:</span>
                            <input type="date" className="border p-1 rounded w-36"
                              value={expirationFrom ? expirationFrom.toISOString().split("T")[0] : ""}
                              onChange={e => setExpirationFrom(e.target.value ? new Date(e.target.value) : null)}/>
                          </label>
                          <label className="flex justify-between text-sm">
                            <span>To:</span>
                            <input type="date" className="border p-1 rounded w-36"
                              value={expirationTo ? expirationTo.toISOString().split("T")[0] : ""}
                              onChange={e => setExpirationTo(e.target.value ? new Date(e.target.value) : null)}/>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                ))}
                <button
  onClick={() => {
    setLicenseFilter([]);
    setVendorFilter([]);
    setMinPrice("");
    setMaxPrice("");
    setPurchaseFrom(null);
    setPurchaseTo(null);
    setExpirationFrom(null);
    setExpirationTo(null);
    setExpirationQuickFilter(null);
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
            <Settings size={18} /> Columns
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
                    }}/>
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddSoftwarePage isOpen={isOpenForm} onClose={() => setIsOpenForm(false)} onCreate={handleAdd}/>

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
            {filteredSoftwares.map((s, index) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3 border-r flex justify-between items-center">
                  <span>{index + 1}</span>
                  <div className="flex flex-col ml-2 gap-1">
                    <button onClick={() => openSoftwarePopup(s.id)} className="text-blue-500 hover:text-blue-700">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                {allColumns.filter(col => visibleColumns.includes(col.key)).map(col => {
  let value = s[col.key];
  let cellClass = "p-3 border-r truncate";

  // формат дат
  if (col.key === "purchaseDate" || col.key === "expirationDate") {
    value = value ? new Date(value).toLocaleDateString() : "-";

    //expiration
    if (col.key === "expirationDate" && s.expirationDate) {
      const today = new Date();
      const expDate = new Date(s.expirationDate);
      const diffDays =
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (expDate < today) {
        cellClass += " bg-red-100";
      } else if (diffDays <= 30) {
        cellClass += " bg-yellow-100";
      }
    }
  }

  return (
    <td key={col.key} className={cellClass}>
      {value ?? "-"}
    </td>
  );
})}

              </tr>
            ))}
            {!filteredSoftwares.length && (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="p-4 text-center text-gray-500">
                  No softwares
                </td>
              </tr>
            )}
          </tbody>
          </table>
</div>
</div>


      {selectedSoftwareId && (
  <SoftwareProfilePage softwareId={selectedSoftwareId} onClose={closeSoftwarePopup} onUpdate={loadSoftwares}/>
)}

    </div>
  );
};
