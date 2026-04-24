import { useState } from "react";
import { X } from "lucide-react";

type User = { id: string; userId: string; userName: string; licenseKey: string };
type Device = { id: string; deviceId: string; deviceName: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
};

export const AddSoftwarePage = ({ isOpen, onClose, onCreate }: Props) => {
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    version: "",
    licenseType: "",
    totalLicenses: 0,
    licensesInUse: 0,
    price: 0,
    purchaseDate: "",
    expirationDate: "",
    vendor: "",
    notes: "",
    users: [] as User[],
    devices: [] as Device[],
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        name === "totalLicenses" || name === "price"
          ? Number(value)
          : value,
    }));
  };

  //VALIDATION
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.version.trim()) return "Version is required";
    if (!form.licenseType.trim()) return "License Type is required";
    if (!form.totalLicenses || form.totalLicenses <= 0)
      return "Total Licenses must be greater than 0";
    if (!form.price || form.price < 0) return "Price is required";
    if (!form.purchaseDate) return "Purchase Date is required";
    if (!form.expirationDate) return "Expiration Date is required";
    if (!form.vendor.trim()) return "Vendor is required";

    return "";
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    await onCreate({
      id: "soft-" + Date.now(),
      ...form,
    });

    setError("");

    setForm({
      name: "",
      version: "",
      licenseType: "",
      totalLicenses: 0,
      licensesInUse: 0,
      price: 0,
      purchaseDate: "",
      expirationDate: "",
      vendor: "",
      notes: "",
      users: [],
      devices: [],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh] relative">

        {/* CLOSE */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Software</h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-2 gap-3">

        <div><label>Name</label><input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full rounded" /></div>

<div><label>Version</label><input name="version" value={form.version} onChange={handleChange} className="border p-2 w-full rounded" /></div>

          <div><label>License Type</label><input name="licenseType" value={form.licenseType} onChange={handleChange} className="border p-2 w-full rounded" /></div>

<div><label>Total Licenses</label><input name="totalLicenses" type="number" value={form.totalLicenses} onChange={handleChange} className="border p-2 w-full rounded" /></div>

          <div><label>Price</label><input name="price" type="number" value={form.price} onChange={handleChange} className="border p-2 w-full rounded" /></div>

<div><label>Vendor</label><input name="vendor" value={form.vendor} onChange={handleChange} className="border p-2 w-full rounded" /></div>

          <div><label>Purchase Date</label><input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} className="border p-2 w-full rounded" /></div>

<div><label>Expiration Date</label><input name="expirationDate" type="date" value={form.expirationDate} onChange={handleChange} className="border p-2 w-full rounded" /></div>

          {/* NOTES (NOT REQUIRED) */}
          <div className="col-span-2">
            <label>Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="border p-2 w-full rounded" rows={3} />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-6">
          <button onClick={handleSubmit} className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600">
            Create
          </button>

          <button onClick={onClose} className="bg-gray-200 w-full p-2 rounded hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

