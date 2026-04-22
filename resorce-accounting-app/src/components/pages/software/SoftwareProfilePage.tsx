import { SelectModal } from "../../pages/home/SelectModal";
import { useEffect, useState } from "react";
import { softwareService } from "../../../services/software/software.swagger.services";
import { userService } from "../../../services/user/user.swagger.services";
import { deviceService } from "../../../services/devices/device.swagger.services";

// scroll lock
const lockBodyScroll = () => {
  const scrollBarCompensation =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = scrollBarCompensation + "px";
};

const unlockBodyScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

interface Props {
  softwareId: string;
  onClose: () => void;
  onUpdate?: (software: any) => void;
}

export const SoftwareProfilePage = ({
  softwareId,
  onClose,
  onUpdate,
}: Props) => {
  const [software, setSoftware] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allDevices, setAllDevices] = useState<any[]>([]);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await softwareService.getSoftwareById(softwareId);
        const users = await userService.getUsers();
        const devices = await deviceService.getDevices();

        const normalized = Array.isArray(data) ? data[0] : data;

        const fixed = {
          ...normalized,
          users: normalized.users || [],
          devices: normalized.devices || [],
          notes: normalized.notes || "",
          purchaseDate: normalized.purchaseDate || "",
          expirationDate: normalized.expirationDate || "",
        };

        setSoftware(fixed);
        setFormData(fixed);

        setAllUsers(users);
        setAllDevices(devices);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [softwareId]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await softwareService.patchSoftware(
        software.id,
        formData
      );

      const fixed = {
        ...updated,
        users: updated.users || [],
        devices: updated.devices || [],
        notes: updated.notes || "",
        purchaseDate: updated.purchaseDate || "",
        expirationDate: updated.expirationDate || "",
      };

      setSoftware(fixed);
      setFormData(fixed);

      onUpdate?.(updated);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const reset = {
      ...software,
      users: software?.users || [],
      devices: software?.devices || [],
      notes: software?.notes || "",
      purchaseDate: software?.purchaseDate || "",
      expirationDate: software?.expirationDate || "",
    };

    setFormData(reset);
    setIsEditing(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!software) return <p>Software not found</p>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh] shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {isEditing ? (
              <input className="border p-2 rounded w-full" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
            ) : (
              software.name
            )}
          </h2>

          <div className="flex gap-2">
            {!isEditing && (
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["version", "Version"],
            ["licenseType", "License Type"],
            ["totalLicenses", "Total Licenses"],
            ["price", "Price"],
            ["vendor", "Vendor"],
            ["purchaseDate", "Purchase Date"],
            ["expirationDate", "Expiration Date"],
          ].map(([key, label]) => (
            <div key={key} className="bg-gray-50 p-3 rounded shadow-sm">
              <div className="text-xs text-gray-500">{label}</div>

              {isEditing ? (
                <input className="border p-2 w-full rounded" value={formData[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)} />
              ) : (
                <div className="font-medium">
                  {software[key] || "-"}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* USERS */}
        <div className="mt-6">
          <div className="flex justify-between">
            <h3 className="font-semibold">Users</h3>
            {isEditing && (
              <button onClick={() => setUserModalOpen(true)} className="bg-blue-500 text-white px-2 py-1 rounded">
                + Add User
              </button>
            )}
          </div>

          {(formData.users || []).map((u: any) => (
            <div
              key={u.id}
              className="bg-gray-50 p-2 rounded mt-2 flex justify-between">
              <span>{u.userName}</span>
            </div>
          ))}
        </div>

        {/* DEVICES */}
        <div className="mt-6">
          <div className="flex justify-between">
            <h3 className="font-semibold">Devices</h3>
            {isEditing && (
              <button onClick={() => setDeviceModalOpen(true)} className="bg-blue-500 text-white px-2 py-1 rounded">
                + Add Device
              </button>
            )}
          </div>

          {(formData.devices || []).map((d: any) => (
            <div key={d.id} className="bg-gray-50 p-2 rounded mt-2 flex justify-between">
              <span>{d.deviceName}</span>
            </div>
          ))}
        </div>

        {/* NOTES */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          <div className="bg-yellow-50 p-3 rounded shadow-inner">
            {isEditing ? (
              <textarea className="w-full border p-2 rounded" value={formData.notes || ""} onChange={(e) => handleChange("notes", e.target.value)} />
            ) : (
              <p>{software.notes || "-"}</p>
            )}
          </div>
        </div>

        {/* SAVE */}
        {isEditing && (
          <div className="mt-6 flex gap-2 justify-end">
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
              {saving ? "Saving..." : "Save"}
            </button>

            <button onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded" >
              Cancel
            </button>
          </div>
        )}

        {/* MODALS */}
        <SelectModal isOpen={userModalOpen} title="Select User" items={allUsers}
          searchKeys={["name", "email"]} onClose={() => setUserModalOpen(false)}
          onSelect={(user) => {
            handleChange("users", [
              ...(formData.users || []),
              {
                id: Date.now(),
                userId: user.id,
                userName: user.name,
              },
            ]);
          }} />

<SelectModal isOpen={deviceModalOpen} title="Select Device" items={allDevices} searchKeys={["name", "serialNumber"]} onClose={() => setDeviceModalOpen(false)} onSelect={(device) => handleChange("devices", [...(formData.devices || []), { id: Date.now(), deviceId: device.id, deviceName: device.name }])} />
      </div>
    </div>
  );
};
