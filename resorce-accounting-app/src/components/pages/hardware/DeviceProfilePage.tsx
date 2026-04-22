import { SelectModal } from "../home/SelectModal";
import { useEffect, useState } from "react";
import { deviceService } from "../../../services/devices/device.swagger.services";
import { userService } from "../../../services/user/user.swagger.services";
import { softwareService } from "../../../services/software/software.swagger.services";

// scroll lock, иначе у меня дергается экран при открытии другой страницы
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
  deviceId: string;
  onClose: () => void;
  onUpdate?: (device: any) => void;
}

export const DeviceProfilePage = ({
  deviceId,
  onClose,
  onUpdate,
}: Props) => {
  const [device, setDevice] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allSoftwares, setAllSoftwares] = useState<any[]>([]);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [softwareModalOpen, setSoftwareModalOpen] = useState(false);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await deviceService.getDeviceById(deviceId);
        const users = await userService.getUsers();
        const softwares = await softwareService.getSoftwares();

        const normalized = Array.isArray(data) ? data[0] : data;

        const fixed = {
          ...normalized,
          assignedUserId: normalized.assignedUserId || "",
          assignedUserName: normalized.assignedUserName || "",
          softwares: normalized.softwares || [],
          notes: normalized.notes || "",
          purchaseDate: normalized.purchaseDate || "",
          warrantyUntil: normalized.warrantyUntil || "",
        };

        setDevice(fixed);
        setFormData(fixed);

        setAllUsers(users);
        setAllSoftwares(softwares);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [deviceId]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await deviceService.patchDevice(device.id, formData);

      const fixed = {
        ...updated,
        assignedUserId: updated.assignedUserId || "",
        assignedUserName: updated.assignedUserName || "",
        softwares: updated.softwares || [],
        notes: updated.notes || "",
        purchaseDate: updated.purchaseDate || "",
        warrantyUntil: updated.warrantyUntil || "",
      };

      setDevice(fixed);
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
      ...device,
      assignedUserId: device?.assignedUserId || "",
      assignedUserName: device?.assignedUserName || "",
      softwares: device?.softwares || [],
      notes: device?.notes || "",
      purchaseDate: device?.purchaseDate || "",
      warrantyUntil: device?.warrantyUntil || "",
    };

    setFormData(reset);
    setIsEditing(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!device) return <p>Device not found</p>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh] shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {isEditing ? (
              <input className="border p-2 rounded w-full" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)}/>
            ) : (
              device.name
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

        {/* DEVICE INFO */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["type", "Type"],
            ["model", "Model"],
            ["serialNumber", "Serial Number"],
            ["inventoryNumber", "Inventory Number"],
            ["os", "OS"],
            ["cpu", "CPU"],
            ["ram", "RAM"],
            ["supplier", "Supplier"],
            ["price", "Price"],
            ["status", "Status"],
            ["purchaseDate", "Purchase Date"],
            ["warrantyUntil", "Warranty Until"],
            ["assignedUserName", "Assigned User"],
          ].map(([key, label]) => (
            <div key={key} className="bg-gray-50 p-3 rounded shadow-sm">
              <div className="text-xs text-gray-500">{label}</div>

              {isEditing ? (
                key === "assignedUserName" ? (
                  <button className="border p-2 w-full rounded bg-blue-50 text-left" onClick={() => setUserModalOpen(true)}>
                    {formData.assignedUserName
                      ? `User: ${formData.assignedUserName}`
                      : "Select User"}
                  </button>
                ) : (
                  <input className="border p-2 w-full rounded" value={formData[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)}/>
                )
              ) : (
                <div className="font-medium">
                  {device[key] || "-"}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SOFTWARE */}
        <div className="mt-6">
          <div className="flex justify-between">
            <h3 className="font-semibold">Software</h3>
            {isEditing && (
              <button onClick={() => setSoftwareModalOpen(true)} className="bg-blue-500 text-white px-2 py-1 rounded">
                + Add Software
              </button>
            )}
          </div>

          {(formData.softwares || []).map((s: any) => (
            <div key={s.id} className="bg-gray-50 p-2 rounded mt-2 flex justify-between">
              <span>{s.softwareName}</span>
            </div>
          ))}
        </div>

        {/* NOTES */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          <div className="bg-yellow-50 p-3 rounded shadow-inner">
            {isEditing ? (
              <textarea
                className="w-full border p-2 rounded"
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            ) : (
              <p>{device.notes || "-"}</p>
            )}
          </div>
        </div>

        {/* HISTORY*/}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">History</h3>

          <div className="bg-gray-100 p-3 rounded">
            <div className="text-xs text-gray-500 mb-1">
              Created / Purchase Date
            </div>

            <div>
              {device.purchaseDate || "No creation date"}
            </div>
          </div>
        </div>

        {/* SAVE */}
        {isEditing && (
          <div className="mt-6 flex gap-2 justify-end">
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
              {saving ? "Saving..." : "Save"}
            </button>

            <button onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        )}

        {/* USER MODAL */}
        <SelectModal isOpen={userModalOpen} title="Select User" items={allUsers} searchKeys={["name", "email"]} onClose={() => setUserModalOpen(false)}
          onSelect={(user) => {
            handleChange("assignedUserId", user.id);
            handleChange("assignedUserName", user.name);
          }}
        />

        {/* SOFTWARE MODAL */}
        <SelectModal isOpen={softwareModalOpen} title="Select Software" items={allSoftwares} searchKeys={["name"]} onClose={() => setSoftwareModalOpen(false)}
          onSelect={(sw) => {
            setFormData((prev: any) => ({
              ...prev,
              softwares: [
                ...(prev.softwares || []),
                {
                  id: Date.now(),
                  softwareId: sw.id,
                  softwareName: sw.name,
                },
              ],
            }));
          }}
        />
      </div>
    </div>
  );
};