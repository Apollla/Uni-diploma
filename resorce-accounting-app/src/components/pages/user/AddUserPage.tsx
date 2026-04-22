import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { deviceService } from "../../../services/devices/device.swagger.services";
import { softwareService } from "../../../services/software/software.swagger.services";
import { SelectModal } from "../../pages/home/SelectModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
};

export const AddUserPage = ({ isOpen, onClose, onCreate }: Props) => {
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    department: "",

    devicesCount: 0,
    licensesCount: 0,

    devices: [] as any[],
    softwares: [] as any[],
    history: [] as any[],
  });

  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [allSoftwares, setAllSoftwares] = useState<any[]>([]);

  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [softwareModalOpen, setSoftwareModalOpen] = useState(false);

  //LOAD
  useEffect(() => {
    const load = async () => {
      try {
        const devices = await deviceService.getDevices();
        const softwares = await softwareService.getSoftwares();

        setAllDevices(devices);
        setAllSoftwares(softwares);
      } catch (e) {
        console.error(e);
      }
    };

    if (isOpen) load();
  }, [isOpen]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  //AUTO COUNTERS
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      devicesCount: prev.devices.length,
      licensesCount: prev.softwares.length,
    }));
  }, [form.devices, form.softwares]);

  //DEVICES
  const addDevice = (device: any) => {
    setForm(prev => {
      if (prev.devices.some(d => d.deviceId === device.id)) return prev;

      return {
        ...prev,
        devices: [
          ...prev.devices,
          {
            id: Date.now(),
            deviceId: device.id,
            deviceName: device.name,
            assignedAt: new Date().toISOString(),
          },
        ],
      };
    });
  };

  const removeDevice = (id: number) => {
    setForm(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== id),
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
            licenseType: sw.licenseType || "",
          },
        ],
      };
    });
  };

  const removeSoftware = (id: number) => {
    setForm(prev => ({
      ...prev,
      softwares: prev.softwares.filter(s => s.id !== id),
    }));
  };

  //VALIDATION
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Invalid email";

    if (!form.position.trim()) return "Position is required";
    if (!form.department.trim()) return "Department is required";

    return "";
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    await onCreate({
      id: "user-" + Date.now(),
      ...form,
    });

    setError("");

    setForm({
      name: "",
      email: "",
      position: "",
      department: "",
      devicesCount: 0,
      licensesCount: 0,
      devices: [],
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

          <h2 className="text-xl font-semibold mb-4">Add User</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded mb-3">
              {error}
            </div>
          )}

          {/* GRID */}
          <div className="grid grid-cols-2 gap-3">

            {[
              ["name", "Name"],
              ["email", "Email"],
              ["position", "Position"],
              ["department", "Department"],
            ].map(([k, l]) => (
              <div key={k}>
                <label>{l}</label>
                <input name={k} value={(form as any)[k]} onChange={handleChange} className="border p-2 w-full rounded" />
              </div>
            ))}

<div>
  <label>Devices Count</label>
  <input value={form.devicesCount} readOnly className="border p-2 w-full rounded bg-gray-100" />
</div>

<div>
  <label>Licenses Count</label>
  <input value={form.licensesCount} readOnly className="border p-2 w-full rounded bg-gray-100" />
</div>
          </div>

          {/* DEVICES */}
          <div className="mt-6">
            <div className="flex justify-between">
              <h3>Devices</h3>
              <button onClick={() => setDeviceModalOpen(true)}
                className="bg-blue-500 text-white px-2 py-1 rounded">
                + Add Device
              </button>
            </div>

            {form.devices.map((d: any) => (
              <div key={d.id} className="flex justify-between border p-2 mt-2 rounded">
                <span>{d.deviceName}</span>
                <button onClick={() => removeDevice(d.id)}>✕</button>
              </div>
            ))}
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

          {/* BUTTONS */}
          <div className="flex gap-3 mt-6">
            <button onClick={handleSubmit} className="bg-blue-500 text-white w-full p-2 rounded" >
              Create
            </button>

            <button onClick={onClose} className="bg-gray-200 w-full p-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* DEVICE MODAL */}
      <SelectModal
        isOpen={deviceModalOpen}
        title="Select Device"
        items={allDevices}
        searchKeys={["name", "serialNumber"]}
        onClose={() => setDeviceModalOpen(false)}
        onSelect={addDevice}
      />

      {/* SOFTWARE MODAL */}
      <SelectModal
        isOpen={softwareModalOpen}
        title="Select Software"
        items={allSoftwares}
        searchKeys={["name"]}
        onClose={() => setSoftwareModalOpen(false)}
        onSelect={addSoftware}
      />
    </>
  );
};


