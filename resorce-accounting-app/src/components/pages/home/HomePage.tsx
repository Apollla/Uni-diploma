import { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { deviceService } from "../../../services/device.services";
import { softwareService } from "../../../services/software.services";
import { Card } from "../../common/dashboard/Card";
import { ChartBox } from "../../common/dashboard/ChartBox";
import { ListCard } from "../../common/dashboard/ListCard";
import "../home/Home.css";

export const HomePage = () => {
  const deviceStats = useMemo(() => deviceService.getStats(), []);
  const softwareStats = useMemo(() => softwareService.getStats(), []);

  const devices = useMemo(() => deviceService.getDevices(), []);
  const softwares = useMemo(() => softwareService.getSoftwares(), []);

  // Available devices grouped by type (могу перенести в другой файл с логикой, если надо)
  const availableDevicesByType = useMemo(() => {
    const availableDevices = devices.filter(d => d.status === "Available");
    const grouped: Record<string, number> = {};
    availableDevices.forEach(d => {
      grouped[d.type] = (grouped[d.type] || 0) + 1;
    });
    return grouped;
  }, [devices]);

  // Calendar helpers
  const renderTileContent =
    (items: any[], dateKey: string) =>
    ({ date, view }: any) => {
      if (view !== "month") return null;

      const dayItems = items.filter(
        (i) => new Date(i[dateKey]).toDateString() === date.toDateString()
      );

      if (!dayItems.length) return null;

      return (
        <div className="flex flex-col items-end gap-0.5">
          {dayItems.map((i) => (
            <span key={i.id} className="w-2 h-2 bg-red-500 rounded-full" title={`${i.name} — ${i[dateKey]}`} /> ))}
        </div>
      );
    };

  const getTileClassName =
    (items: any[], dateKey: string) =>
    ({ date, view }: any) => {
      if (view !== "month") return "";
      return items.some( (i) => new Date(i[dateKey]).toDateString() === date.toDateString()) ? "expiring" : "";
    };

  // Next 7 days (including today) for calendar
  const getNext7DaysRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start: today, end };
  };

  const devicesExpiringNext7Days = useMemo(() => {
    const { start, end } = getNext7DaysRange();
    return devices.filter(d => {
      const date = new Date(d.warrantyUntil);
      return date >= start && date <= end;
    });
  }, [devices]);

  const softwaresExpiringNext7Days = useMemo(() => {
    const { start, end } = getNext7DaysRange();
    return softwares.filter(s => {
      const date = new Date(s.expirationDate);
      return date >= start && date <= end;
    });
  }, [softwares]);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="max-w-[1920px] mx-auto p-6">

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
            <div className="flex flex-col gap-6">

              <div className="bg-white rounded-2xl p-4 shadow-sm h-fit">
                <h2 className="font-semibold mb-4">Fast Actions</h2>
                <div className="flex flex-col gap-3">
                  <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">Add Device</button>
                  <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">Add Software</button>
                  <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">Generate Report</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-medium">Recently Added</h3>
              </div>

            </div>

            <div className="flex flex-col gap-6">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4 h-full">
                  <h2 className="font-semibold mb-2">Hardware</h2>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                    <Card title="Total Devices" value={deviceStats.total} />
                    <Card title="In Use" value={deviceStats.inUse} />
                    <Card title="Available" value={deviceStats.available} />
                    <Card title="In Repair" value={deviceStats.inRepair} />
                    <Card title="Expiring Warranty" value={deviceStats.expiringWarranty} />
                    <Card title="Suppliers" value={deviceStats.suppliers} />
                  </div>

                  <ListCard
                    title="Available Devices by Type"
                    emptyText="No available devices"
                    items={Object.entries(availableDevicesByType).map(([type, count]) => ({
                      title: type,
                      rightText: String(count),
                    }))}
                  />
                </div>

                <div className="flex flex-col gap-4 h-full">
                  <h2 className="font-semibold mb-2">Software</h2>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                    <Card title="Total Licenses" value={softwareStats.totalLicenses} />
                    <Card title="Expiring Licenses" value={softwareStats.expiringLicenses} />
                    <Card title="Total Products" value={softwareStats.totalProducts} />
                    <Card title="Vendors" value={softwareStats.vendors} />
                    <Card title="Subscriptions" value={softwareStats.activeSubscriptions} />
                    <Card title="Perpetual" value={softwareStats.perpetualLicenses} />
                  </div>

                  <ListCard
                    title="Unused Licenses"
                    emptyText="No software available"
                    items={softwares
                      .filter(s => (s.totalLicenses - (s.users?.length || 0)) > 0)
                      .map(s => {
                        const used = s.users?.length || 0;
                        const unused = s.totalLicenses - used;
                        const usedPercent = s.totalLicenses ? Math.round((used / s.totalLicenses) * 100): 0;
                        return {
                          title: s.name, subtitle: `${unused} unused licenses`, rightText: `${usedPercent}% used`,
                        };
                      })} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartBox title="Devices Status">
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <span>In Use: {deviceStats.inUse}</span>
                    <span>Available: {deviceStats.available}</span>
                    <span>In Repair: {deviceStats.inRepair}</span>
                    <span>Expiring: {deviceStats.expiringWarranty}</span>
                  </div>
                </ChartBox>

                <ChartBox title="Licenses Overview">
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <span>Total: {softwareStats.totalLicenses}</span>
                    <span>Expiring: {softwareStats.expiringLicenses}</span>
                  </div>
                </ChartBox>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="font-semibold">Warranty Calendar</h2>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="mb-2">Hardware</h3>
              <Calendar
                locale="en-US"
                tileClassName={getTileClassName(devices, "warrantyUntil")}
                tileContent={renderTileContent(devices, "warrantyUntil")} />

              <div className="mt-4">
                <h4 className="font-medium mb-2">Expiring Next 7 Days</h4>
                {devicesExpiringNext7Days.length ? (
                  <ul className="list-disc pl-5">
                    {devicesExpiringNext7Days
                      .slice()
                      .sort((a, b) => new Date(a.warrantyUntil).getTime() - new Date(b.warrantyUntil).getTime())
                      .map(d => (
                        <li key={d.id}>
                          {d.name} — {new Date(d.warrantyUntil).toLocaleDateString("en-US")}
                        </li>
                      ))}
                  </ul> ) : ( <p className="text-gray-500 text-sm">No devices expiring this week</p> )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="mb-2">Software</h3>
              <Calendar
                locale="en-US"
                tileClassName={getTileClassName(softwares, "expirationDate")}
                tileContent={renderTileContent(softwares, "expirationDate")} />

              <div className="mt-4">
                <h4 className="font-medium mb-2">Expiring Next 7 Days</h4>
                {softwaresExpiringNext7Days.length ? (
                  <ul className="list-disc pl-5">
                    {softwaresExpiringNext7Days
                      .slice()
                      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
                      .map(s => (
                        <li key={s.id}>
                          {s.name} — {new Date(s.expirationDate).toLocaleDateString("en-US")}
                        </li> ))}
                  </ul> ) : ( <p className="text-gray-500 text-sm">No licenses expiring this week</p> )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};



