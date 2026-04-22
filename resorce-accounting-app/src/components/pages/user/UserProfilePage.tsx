import { useEffect, useState } from "react";
import { userService } from "../../../services/user/user.swagger.services";
import { deviceService } from "../../../services/devices/device.swagger.services";
import { softwareService } from "../../../services/software/software.swagger.services";
import { SelectModal } from "../../pages/home/SelectModal";


// scroll lock
const lockBodyScroll = () => {
  const scrollBarCompensation = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = scrollBarCompensation + "px";
};
const unlockBodyScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

interface Props {
  userId: string;
  onClose: () => void;
  onUpdate?: (user: any) => void;
}

export const UserProfilePage = ({ userId, onClose, onUpdate }: Props) => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [softwares, setSoftwares] = useState<any[]>([]);

  const [showDeviceSelect, setShowDeviceSelect] = useState(false);
  const [showSoftwareSelect, setShowSoftwareSelect] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await userService.getUserById(userId);
        const normalized = Array.isArray(userData) ? userData[0] : userData;

        const devs = await deviceService.getDevices();
        const softs = await softwareService.getSoftwares();

        setUser(normalized);
        setFormData(normalized);
        setDevices(devs);
        setSoftwares(softs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  //DEVICES
  const addDevice = (deviceId: string) => {
    const d = devices.find(x => x.id === deviceId);
    if (!d) return;

    handleChange("devices", [
      ...(formData.devices || []),
      {
        id: Date.now(),
        deviceId: d.id,
        deviceName: d.name,
        assignedAt: new Date().toISOString()
      }
    ]);

    setShowDeviceSelect(false);
  };

  const removeDevice = (id: number) => {
    handleChange("devices", formData.devices.filter((d: any) => d.id !== id));
  };

  //SOFTWARE
  const addSoftware = (softwareId: string) => {
    const s = softwares.find(x => x.id === softwareId);
    if (!s) return;

    handleChange("softwares", [
      ...(formData.softwares || []),
      {
        id: Date.now(),
        softwareId: s.id,
        softwareName: s.name,
        licenseType: s.licenseType
      }
    ]);

    setShowSoftwareSelect(false);
  };

  const removeSoftware = (id: number) => {
    handleChange("softwares", formData.softwares.filter((s: any) => s.id !== id));
  };

  //HISTORY*?????
  const addHistory = () => {
    handleChange("history", [
      ...(formData.history || []),
      {
        id: Date.now(),
        action: "",
        description: "",
        date: new Date().toISOString()
      }
    ]);
  };

  //SAVE
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.patchUser(user.id, {
        ...formData,
        devicesCount: formData.devices?.length || 0,
        licensesCount: formData.softwares?.length || 0
      });

      setUser(updated);
      if (onUpdate) onUpdate(updated);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]">

        {/* HEADER */}
        <div className="absolute top-4 right-4 flex gap-2">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-blue-500 text-white rounded">
              Edit
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 text-lg">✕</button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          {isEditing ? (
            <input value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} className="border p-1 rounded w-full"/>
          ) : user.name}
        </h2>

        {/* MAIN INFO */}
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">

          {["email","position","department"].map(key => (
            <div key={key}>
              <b>{key}:</b>
              {isEditing ? (
                <input value={formData[key] || ""} onChange={(e) => handleChange(key, e.target.value)} className="border p-1 rounded w-full mt-1"/>
              ) : (
                <span className="ml-1">{user[key] || "-"}</span>
              )}
            </div>
          ))}

          <div>
            <b>Devices:</b>
            <span className="ml-1">{formData.devices?.length || 0}</span>
          </div>

          <div>
            <b>Licenses:</b>
            <span className="ml-1">{formData.softwares?.length || 0}</span>
          </div>

        </div>

        {/* DEVICES */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Devices</h2>

            {isEditing && (
              <button onClick={() => setShowDeviceSelect(true)} className="bg-blue-500 text-white px-2 py-1 rounded">
              + Add Device
            </button>
            
            )}
          </div>

          {formData.devices?.length
            ? formData.devices.map((d: any) => (
                <div key={d.id} className="flex justify-between py-1">
                  <span>{d.deviceName}</span>
                  {isEditing && (
                    <button onClick={() => removeDevice(d.id)} className="text-red-500">
                      Remove
                    </button>
                  )}
                </div>
              ))
            : <p>No devices</p>}

          
        </div>

        {/* SOFTWARE */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Software</h2>

            {isEditing && (
              <button onClick={() => setShowSoftwareSelect(true)} className="bg-blue-500 text-white px-2 py-1 rounded">
              + Add Software
            </button>
            
            )}
          </div>

          {formData.softwares?.length
            ? formData.softwares.map((s: any) => (
                <div key={s.id} className="flex justify-between py-1">
                  <span>{s.softwareName}</span>
                  {isEditing && (
                    <button onClick={() => removeSoftware(s.id)} className="text-red-500">
                      Remove
                    </button>
                  )}
                </div>
              ))
            : <p>No software</p>}

          
        </div>

        {/* SAVE */}
        {isEditing && (
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
          </div>
        )}

      </div>

      {/* DEVICE MODAL */}
<SelectModal
  isOpen={showDeviceSelect}
  title="Select Device"
  items={devices}
  searchKeys={["name", "serialNumber"]}
  onClose={() => setShowDeviceSelect(false)}
  onSelect={(device) => {
    handleChange("devices", [
      ...(formData.devices || []),
      {
        id: Date.now(),
        deviceId: device.id,
        deviceName: device.name,
        assignedAt: new Date().toISOString()
      }
    ]);
  }}
/>

{/* SOFTWARE MODAL */}
<SelectModal
  isOpen={showSoftwareSelect}
  title="Select Software"
  items={softwares}
  searchKeys={["name", "vendor"]}
  onClose={() => setShowSoftwareSelect(false)}
  onSelect={(software) => {
    handleChange("softwares", [
      ...(formData.softwares || []),
      {
        id: Date.now(),
        softwareId: software.id,
        softwareName: software.name,
        licenseType: software.licenseType
      }
    ]);
  }}
/>

    </div>
  );
};
