import { useState } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  items: any[];
  onSelect: (item: any) => void;
  onClose: () => void;
  searchKeys: string[];
};

export const SelectModal = ({
  isOpen,
  title,
  items,
  onSelect,
  onClose,
  searchKeys,
}: Props) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = items.filter((item) =>
    searchKeys.some((key) =>
      (item[key] || "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
      <div className="bg-white w-full max-w-lg p-4 rounded-xl shadow-lg">

        <h2 className="text-lg font-semibold mb-3">{title}</h2>

        <input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 w-full rounded mb-3" />

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {filtered.map((item) => (
            <div key={item.id} onClick={() => {
                onSelect(item);
                onClose();
              }}
              className="p-2 border rounded cursor-pointer hover:bg-gray-100">
              <div className="font-medium">{item.name}</div>

              {item.email && (
                <div className="text-xs text-gray-500">{item.email}</div>
              )}

              {item.serialNumber && (
                <div className="text-xs text-gray-500">
                  SN: {item.serialNumber}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-4 w-full bg-gray-200 p-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};
