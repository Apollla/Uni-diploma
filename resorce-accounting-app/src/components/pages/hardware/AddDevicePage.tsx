import { useEffect, useState } from "react";
import { userService } from "../../../services/user/user.swagger.services";
import { softwareService } from "../../../services/software/software.swagger.services";
import { SelectModal } from "../home/SelectModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
};

export const AddDevicePage = ({ isOpen, onClose, onCreate }: Props) => {
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "",
    model: "",
    serialNumber: "",
    inventoryNumber: "",
    os: "",
    cpu: "",
    ram: 8,
    supplier: "",
    price: "",
    purchaseDate: "",
    warrantyUntil: "",
    status: "Available",
    notes: "",
    assignedUserId: "",
    assignedUserName: "",
    softwares: [] as any[],
    history: [] as any[],
  });

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allSoftwares, setAllSoftwares] = useState<any[]>([]);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [softwareModalOpen, setSoftwareModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const users = await userService.getUsers();
        const softwares = await softwareService.getSoftwares();
        setAllUsers(users);
        setAllSoftwares(softwares);
      } catch (e) {
        console.error(e);
      }
    };

    if (isOpen) load();
  }, [isOpen]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "ram" && Number(value) < 0) return;

    if (name === "price") {
      if (!/^\d*$/.test(value)) return;
      setForm(prev => ({ ...prev, price: value }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: name === "ram" ? Number(value) : value
    }));
  };

  //SOFTWARE
  const addSoftware = (sw: any) => {
    setForm(prev => {
      if (prev.softwares.some(s => s.softwareId === sw.id)) return prev;

      return {
        ...prev,
        softwares: [
          ...prev.softwares,
          {
            id: Date.now(),
            softwareId: sw.id,
            softwareName: sw.name,
            installedAt: new Date().toISOString(),
          }
        ]
      };
    });
  };

  const removeSoftware = (id: number) => {
    setForm(prev => ({
      ...prev,
      softwares: prev.softwares.filter(s => s.id !== id)
    }));
  };

  //HISTORY
  const addHistory = () => {
    setForm(prev => ({
      ...prev,
      history: [
        ...prev.history,
        {
          id: Date.now(),
          action: "",
          description: "",
          date: new Date().toISOString(),
        }
      ]
    }));
  };

  const removeHistory = (id: number) => {
    setForm(prev => ({
      ...prev,
      history: prev.history.filter(h => h.id !== id)
    }));
  };

  //VALIDATION
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.type.trim()) return "Type is required";
    if (!form.model.trim()) return "Model is required";
    if (!form.serialNumber.trim()) return "Serial Number is required";
    if (!form.inventoryNumber.trim()) return "Inventory Number is required";
    if (!form.os.trim()) return "OS is required";
    if (!form.cpu.trim()) return "CPU is required";
    if (!form.purchaseDate) return "Purchase Date is required";
    if (!form.warrantyUntil) return "Warranty Date is required";
    if (form.ram < 0) return "RAM cannot be negative";

    return "";
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    await onCreate({
      id: "dev-" + Date.now(),
      ...form,
      price: Number(form.price || 0),
    });

    setError("");

    setForm({
      name: "",
      type: "",
      model: "",
      serialNumber: "",
      inventoryNumber: "",
      os: "",
      cpu: "",
      ram: 8,
      supplier: "",
      price: "",
      purchaseDate: "",
      warrantyUntil: "",
      status: "Available",
      notes: "",
      assignedUserId: "",
      assignedUserName: "",
      softwares: [],
      history: [],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          <h2 className="text-xl font-semibold mb-4">Add Device</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded mb-3">
              {error}
            </div>
          )}

          {/* MAIN GRID */}
          <div className="grid grid-cols-2 gap-3">

            {[
              ["name","Name"],
              ["type","Type"],
              ["model","Model"],
              ["serialNumber","Serial Number"],
              ["inventoryNumber","Inventory Number"],
              ["cpu","CPU"],
              ["supplier","Supplier"],
              ["assignedUserName","Assigned User"],
            ].map(([k,l]) => (
              <div key={k}>
                <label>{l}</label>

                {k === "assignedUserName" ? (
                  <div onClick={() => setUserModalOpen(true)} className="border p-2 w-full rounded bg-blue-50 cursor-pointer">
                    {form.assignedUserName || "Select User"}
                  </div>
                ) : (
                  <input name={k} value={(form as any)[k]} onChange={handleChange} className="border p-2 w-full rounded"/>
                )}
              </div>
            ))}

            <div>
              <label>OS</label>
              <select name="os" value={form.os} onChange={handleChange} className="border p-2 w-full rounded">
                <option value="">Select</option>
                <option>Windows 10</option>
                <option>Windows 11</option>
                <option>macOS</option>
                <option>Linux</option>
              </select>
            </div>

            <div>
              <label>RAM</label>
              <input name="ram" type="number" value={form.ram} onChange={handleChange} className="border p-2 w-full rounded"/>
            </div>

            <div>
              <label>Price</label>
              <input name="price" value={form.price} onChange={handleChange} className="border p-2 w-full rounded"/>
            </div>

            <div>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="border p-2 w-full rounded">
                <option>Available</option>
                <option>In Use</option>
                <option>In Repair</option>
              </select>
            </div>

            <div>
              <label>Purchase Date</label>
              <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="border p-2 w-full rounded"/>
            </div>

            <div>
              <label>Warranty Until</label>
              <input type="date" name="warrantyUntil" value={form.warrantyUntil} onChange={handleChange} className="border p-2 w-full rounded"/>
            </div>
          </div>

          {/* NOTES */}
          <div className="mt-4">
            <label>Notes</label>
            <textarea name="notes"value={form.notes} onChange={handleChange} className="border p-2 w-full rounded" rows={3} />
          </div>

          {/* SOFTWARE */}
          <div className="mt-6">
            <div className="flex justify-between">
              <h3>Software</h3>
              <button onClick={() => setSoftwareModalOpen(true)} className="bg-blue-500 text-white px-2 py-1 rounded">
                + Add Software
              </button>
            </div>

            {form.softwares.map((s: any) => (
              <div key={s.id} className="flex justify-between border p-2 mt-2 rounded">
                <span>{s.softwareName}</span>
                <button onClick={() => removeSoftware(s.id)}>✕</button>
              </div>
            ))}
          </div>

          {/* HISTORY */}
          <div className="mt-6">
            <button onClick={addHistory} className="bg-green-500 text-white px-2 py-1 rounded">
              + Add History
            </button>

            {form.history.map((h: any) => (
              <div key={h.id} className="flex gap-2 mt-2">
                <input className="border p-1 w-full" value={h.action} placeholder="Action" onChange={(e) => {
                    setForm(prev => ({
                      ...prev,
                      history: prev.history.map(x =>
                        x.id === h.id ? { ...x, action: e.target.value } : x)
                    }));
                  }}/>
                <button onClick={() => removeHistory(h.id)}>✕</button>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-6">
            <button onClick={handleSubmit} className="bg-blue-500 text-white w-full p-2 rounded">
              Create
            </button>
            <button onClick={onClose} className="bg-gray-200 w-full p-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* USER MODAL */}
      <SelectModal isOpen={userModalOpen} title="Select User" items={allUsers} searchKeys={["name","email"]} onClose={() => setUserModalOpen(false)}
        onSelect={(user) => {
          setForm(prev => ({
            ...prev,
            assignedUserId: user.id,
            assignedUserName: user.name,
          }));
          setUserModalOpen(false);
        }}
      />

      {/* SOFTWARE MODAL */}
      <SelectModal
        isOpen={softwareModalOpen}
        title="Select Software"
        items={allSoftwares}
        searchKeys={["name"]}
        onSelect={addSoftware}
        onClose={() => setSoftwareModalOpen(false)}
      />
    </>
  );
};

