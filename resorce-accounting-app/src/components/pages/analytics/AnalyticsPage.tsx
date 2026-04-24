import { useEffect, useState } from "react";
import { Card } from "../../common/dashboard/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  PieChart, Pie,
  Legend
} from "recharts";

import { deviceService } from "../../../services/devices/device.swagger.services";
import { softwareService } from "../../../services/software/software.swagger.services";
import { userService } from "../../../services/user/user.swagger.services";

import {
  getTotalExpenses,
  getSoftwareExpenses,
  getHardwareExpenses,
  getUnusedLicensesPercent,
  getDevicesUsagePercent,
  getDevicesInRepairPercent,
  getSoftwareExpensesByMonth,
  getHardwareExpensesByMonth,
  getAssetsGrowth,
  getSoftwareExpensesByLicenseType,
  getSoftwareUsageStats,
  getSoftwareSubscriptionHeatmap
} from "../../../services/analytics/formulas";


const normalizeMonths = (data: any[]) => {
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
    Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
  };

  data.forEach((item) => {
    const date = new Date(item.month);
    const monthName = date.toLocaleString("en-US", { month: "short" });

    if (monthMap[monthName] !== undefined) {
      monthMap[monthName] += item.value ?? 0;
    }
  });

  return Object.entries(monthMap).map(([month, value]) => ({
    month,
    value,
  }));
};

export const AnalyticsPage = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [softwares, setSoftwares] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [devicesData, softwareData, usersData] = await Promise.all([
        deviceService.getDevices(),
        softwareService.getSoftwares(),
        userService.getUsers(),
      ]);

      setDevices(devicesData || []);
      setSoftwares(softwareData || []);
      setUsers(usersData || []);
    };

    load();
  }, []);

  const safeNumber = (v: any) => (isNaN(v) || v == null ? 0 : Number(v));

  // COSTS
  const hardwareCost = safeNumber(getHardwareExpenses(devices));
  const softwareCost = safeNumber(getSoftwareExpenses(softwares));

  const repairCost = safeNumber(
    devices
      .filter((d) => d.status === "In Repair")
      .reduce((sum, d) => sum + Number(d.price || 0), 0)
  );

  const totalExpenses = getTotalExpenses(
    hardwareCost,
    softwareCost,
    repairCost
  );

  const unusedLicenses = getUnusedLicensesPercent(softwares);
  const deviceUsage = getDevicesUsagePercent(devices);
  const devicesInRepair = getDevicesInRepairPercent(devices);

  // MONTHS
  const softwareByMonth = normalizeMonths(getSoftwareExpensesByMonth(softwares));
  const hardwareByMonth = normalizeMonths(getHardwareExpensesByMonth(devices));
  const assetsGrowth = normalizeMonths(getAssetsGrowth(devices));

  const softwareMap = Object.fromEntries(
    softwares.map((s) => [s.id, Number(s.price || 0)])
  );
  
  // DEPARTMENTS
  type DeptAcc = {
    department: string;
    value: number;
  };
  
  const departmentExpenses = Object.values(
    users.reduce((acc: Record<string, DeptAcc>, user) => {
      const department = user.department || "Unassigned";
  
      if (!acc[department]) {
        acc[department] = {
          department,
          value: 0,
        };
      }
  
      const userDevices = devices.filter(
        (d) => d.assignedUserId === user.id
      );
  
      const deviceCost = userDevices.reduce(
        (sum: number, d) => sum + (Number(d.price) || 0),
        0
      );
  
      const userSoftwareCost = (user.softwares || []).reduce(
        (sum: number, s: any) =>
          sum + (softwareMap[s.softwareId] || 0),
        0
      );
  
      const deviceSoftwareCost = userDevices.reduce((sum: number, d) => {
        return (
          sum +
          (d.softwares || []).reduce(
            (s: number, sw: any) =>
              s + (softwareMap[sw.softwareId] || 0),
            0
          )
        );
      }, 0);
  
      acc[department].value =
        Number(acc[department].value || 0) +
        deviceCost +
        userSoftwareCost +
        deviceSoftwareCost;
  
      return acc;
    }, {} as Record<string, DeptAcc>)
  );

  


  // STATUS DATA
  const devicesByStatus = [
    { status: "In Use", value: devices.filter(d => d.status === "In Use").length },
    { status: "Repair", value: devices.filter(d => d.status === "In Repair").length },
    { status: "Available", value: devices.filter(d => d.status === "Available").length },
  ].filter(i => i.value > 0);

  const STATUS_COLORS: any = {
    "In Use": "#3B82F6",
    "Free": "#10B981",
    "Repair": "#F59E0B",
    "Written Off": "#EF4444",
  };

  const softwareByLicenseType = Object.values(
    (softwares || []).reduce((acc: Record<string, number>, s: any) => {
      const type = (s.licenseType || "other").toLowerCase().trim();
  
      const cost =
        Number(s.price || 0) * Number(s.totalLicenses || 1);
  
      acc[type] = (acc[type] || 0) + cost;
  
      return acc;
    }, {})
  ).map((value, index) => {
    const keys = Object.keys(
      (softwares || []).reduce((acc: Record<string, number>, s: any) => {
        const type = (s.licenseType || "other").toLowerCase().trim();
        acc[type] = 0;
        return acc;
      }, {})
    );
  
    return {
      name: keys[index],
      value,
    };
  });
  


  const totalSoftwareCost = softwareByLicenseType.reduce(
    (sum: number, item: any) =>
      sum + (Number(item.value) || 0),
    0
  );

  const LICENSE_COLORS: Record<string, string> = {
    subscription: "#3B82F6",
    perpetual: "#10B981",
    other: "#9CA3AF",
  };
  const softwareUsageData = getSoftwareUsageStats(softwares);

  const subscriptionHeatmap = getSoftwareSubscriptionHeatmap(softwares);
  const maxValue = Math.max(...subscriptionHeatmap.map(d => d.value || 0)) || 1;
  const getHeatColor = (value: number, max: number) => {
    if (!value) return "#E5E7EB";
  
    const ratio = value / max;
  
    if (ratio < 0.2) return "#DBEAFE";
    if (ratio < 0.6) return "#60A5FA";
    if (ratio < 0.8) return "#3B82F6";
    return "#1D4ED8";
  };
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card title="Total Expenses" value={totalExpenses} />
        <Card title="Software Expenses" value={softwareCost} />
        <Card title="Hardware Expenses" value={hardwareCost} />
        <Card title="Unused Licenses (%)" value={unusedLicenses} />
        <Card title="Devices Usage (%)" value={deviceUsage} />
        <Card title="Devices in Repair (%)" value={devicesInRepair} />
      </div>

      {/* CHARTS */}
<div className="mt-10 space-y-10">

<div className="grid gap-6 lg:grid-cols-2">

        {/* SOFTWARE */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
  <h2>Software Expenses</h2>

  <ResponsiveContainer width="100%" height={280}>
    <ComposedChart data={softwareByMonth}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />

      <Bar dataKey="value" fill="#4F46E5" />

      <Line
        type="monotone"
        dataKey="value"
        stroke="#1E1B4B"
        strokeWidth={2}
        dot={true}
      />
    </ComposedChart>
  </ResponsiveContainer>
</div>


        {/* HARDWARE */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
  <h2>Hardware Expenses</h2>

  <ResponsiveContainer width="100%" height={280}>
    <ComposedChart data={hardwareByMonth}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />

      <Bar dataKey="value" fill="#10B981" />

      <Line
        type="monotone"
        dataKey="value"
        stroke="#065F46"
        strokeWidth={2}
        dot={true}
      />
    </ComposedChart>
  </ResponsiveContainer>
</div>


        {/* ASSETS */}
        <div className="bg-white border rounded-2xl shadow-sm p-5 lg:col-span-2">
  <h2>Assets Growth</h2>

  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart data={assetsGrowth}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />

      <Bar dataKey="value" fill="#F59E0B" />

      <Line
        type="monotone"
        dataKey="value"
        stroke="#B45309"
        strokeWidth={2}
        dot={true}
      />
    </ComposedChart>
  </ResponsiveContainer>
</div>
</div>

<div className="grid gap-6 lg:grid-cols-3">
        {/* DEPARTMENTS */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2>Expenses by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis domain={[0, "auto"]} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* STATUS */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2>Devices by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={devicesByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="status" />
              <Tooltip />
              <Bar dataKey="value">
                {devicesByStatus.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

{/* SOFTWARE LICENSE STRUCTURE */}
<div className="bg-white border rounded-2xl shadow-sm p-5">
  <h2 className="text-md font-medium mb-4 text-gray-700">
    Software Expenses Structure
  </h2>

  <ResponsiveContainer width="100%" height={300}>
  <PieChart>
  <Pie
    data={softwareByLicenseType}
    dataKey="value"
    nameKey="name"
    innerRadius={70}
    outerRadius={100}
    paddingAngle={3}
    label={({ name, percent }) => {
      const safe = percent ?? 0;
      return `${name} (${(safe * 100).toFixed(0)}%)`;
    }}
    
  >
    {softwareByLicenseType.map((entry, index) => (
      <Cell
        key={index}
        fill={LICENSE_COLORS[entry.name] || "#ccc"}
      />
    ))}
  </Pie>

  <Tooltip />

  {/* ЛЕГЕНДА */}
  <Legend
    verticalAlign="bottom"
    height={36}
  />

  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="middle"
    className="text-lg font-semibold fill-gray-700"
  >
    {totalSoftwareCost}
  </text>
</PieChart>

  </ResponsiveContainer>
</div>
</div>


<div className="grid gap-6 lg:grid-cols-2">
<div className="bg-white border rounded-2xl shadow-sm p-5">
  <h2 className="text-md font-medium mb-4 text-gray-700">
    Software License Usage
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={softwareUsageData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />

      {/* легенда */}
      <Legend />

      {/* куплено */}
      <Bar
        dataKey="total"
        fill="#3B82F6"
        name="Purchased"
        radius={[6, 6, 0, 0]}
      />

      {/* назначено */}
      <Bar
        dataKey="assigned"
        fill="#F97316"
        name="Assigned"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>




  <div className="bg-white border rounded-2xl shadow-sm p-5">
  <h2 className="text-md font-medium mb-4 text-gray-700">
    Subscription Renewal Heatmap (Next 12 Months)
  </h2>

  <div className="grid grid-cols-6 gap-2">

  {subscriptionHeatmap.map((cell) => {
    const intensity = cell.value / maxValue;

    return (
      <div
  key={cell.month}
  title={`${cell.month}: ${Math.round(cell.value)}`}
  className="h-14 rounded-md flex items-center justify-center text-xs font-medium text-gray-900"
  style={{
    backgroundColor: getHeatColor(cell.value, maxValue),
  }}
>
  <div className="text-center">
    <div>{cell.month.slice(5)}</div>
    <div>{Math.round(cell.value)}</div>
  </div>
</div>

    );
  })}
</div>

</div>
</div>


      </div>
    </div>
  );
};

