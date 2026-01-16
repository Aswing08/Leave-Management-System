import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/DashboardLayout";

type LeaveType = {
  id: number;
  name: string;
  max_leaves_per_year: number;
};

type Holiday = {
  id: number;
  date: string;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdminDashboard() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [leaveTypeName, setLeaveTypeName] = useState("");
  const [leaveMax, setLeaveMax] = useState<number>(1);

  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");

  const fetchAll = async () => {
    const lt = await api.get("/admin/leave-types");
    const hd = await api.get("/admin/holidays");
    const emp = await api.get("/admin/employees");
    const man = await api.get("/admin/managers");

    setLeaveTypes(lt.data);
    setHolidays(hd.data);
    setEmployees(emp.data);
    setManagers(man.data);
  };

  useEffect(() => {
    fetchAll().catch(() => setErr("Failed to load Admin Dashboard"));
  }, []);

  const addLeaveType = async () => {
    setMsg("");
    setErr("");
    try {
      await api.post("/admin/leave-types", {
        name: leaveTypeName,
        max_leaves_per_year: leaveMax,
      });
      setLeaveTypeName("");
      setLeaveMax(1);
      setMsg("Leave Type Created ✅");
      fetchAll();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to create leave type");
    }
  };

  const addHoliday = async () => {
    setMsg("");
    setErr("");
    try {
      await api.post("/admin/holidays", {
        date: holidayDate,
        name: holidayName,
      });
      setHolidayDate("");
      setHolidayName("");
      setMsg("Holiday Added ✅");
      fetchAll();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to add holiday");
    }
  };

  const deleteUser = async (id: number) => {
    setMsg("");
    setErr("");
    try {
      await api.delete(`/admin/users/${id}`);
      setMsg("User deleted ✅");
      fetchAll();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to delete user");
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Manage leave types, holidays & users"
    >
      {msg && (
        <div className="bg-green-600/20 border border-green-600 text-green-200 p-3 rounded-xl mb-4">
          {msg}
        </div>
      )}
      {err && (
        <div className="bg-red-600/20 border border-red-600 text-red-200 p-3 rounded-xl mb-4">
          {err}
        </div>
      )}

      {/* Leave Types */}
      <div className="bg-gray-900 p-5 rounded-2xl mb-6 shadow">
        <h2 className="text-xl font-semibold mb-3">Leave Types</h2>

        <div className="flex gap-2 mb-4">
          <input
            className="p-2 rounded-xl bg-gray-800 w-full"
            placeholder="Leave Type Name"
            value={leaveTypeName}
            onChange={(e) => setLeaveTypeName(e.target.value)}
          />
          <input
            type="number"
            className="p-2 rounded-xl bg-gray-800 w-40"
            value={leaveMax}
            onChange={(e) => setLeaveMax(Number(e.target.value))}
          />
          <button
            onClick={addLeaveType}
            className="bg-blue-600 hover:bg-blue-700 px-4 rounded-xl"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {leaveTypes.map((lt) => (
            <li
              key={lt.id}
              className="flex justify-between bg-gray-800 p-3 rounded-xl"
            >
              <span>
                {lt.name} — <b>{lt.max_leaves_per_year}</b>/year
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Holidays */}
      <div className="bg-gray-900 p-5 rounded-2xl mb-6 shadow">
        <h2 className="text-xl font-semibold mb-3">Holidays</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="date"
            className="p-2 rounded-xl bg-gray-800"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
          />
          <input
            className="p-2 rounded-xl bg-gray-800 w-full"
            placeholder="Holiday Name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
          />
          <button
            onClick={addHoliday}
            className="bg-green-600 hover:bg-green-700 px-4 rounded-xl"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {holidays.map((h) => (
            <li key={h.id} className="bg-gray-800 p-3 rounded-xl">
              {h.date} — {h.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Users */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-5 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-3">Employees</h2>
          {employees.map((u) => (
            <div
              key={u.id}
              className="bg-gray-800 p-3 rounded-xl flex justify-between mb-2"
            >
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>
              <button
                onClick={() => deleteUser(u.id)}
                className="bg-red-600 hover:bg-red-700 px-3 rounded-xl"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 p-5 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-3">Managers</h2>
          {managers.map((u) => (
            <div
              key={u.id}
              className="bg-gray-800 p-3 rounded-xl flex justify-between mb-2"
            >
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>
              <button
                onClick={() => deleteUser(u.id)}
                className="bg-red-600 hover:bg-red-700 px-3 rounded-xl"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
