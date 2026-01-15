import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

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

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [employees, setEmployees] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [leaveName, setLeaveName] = useState("");
  const [maxLeaves, setMaxLeaves] = useState(0);

  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    fetchEmployees();
    fetchManagers();
    fetchLeaveTypes();
    fetchHolidays();
  };

  const fetchEmployees = async () => {
    const res = await axios.get("/admin/employees", authHeader);
    setEmployees(res.data);
  };

  const fetchManagers = async () => {
    const res = await axios.get("/admin/managers", authHeader);
    setManagers(res.data);
  };

  const fetchLeaveTypes = async () => {
    const res = await axios.get("/admin/leave-types", authHeader);
    setLeaveTypes(res.data);
  };

  const fetchHolidays = async () => {
    const res = await axios.get("/admin/holidays", authHeader);
    setHolidays(res.data);
  };

  const deleteUser = async (id: number) => {
    await axios.delete(`/admin/users/${id}`, authHeader);
    fetchAll();
  };

  const addLeaveType = async () => {
    await axios.post(
      "/admin/leave-types",
      { name: leaveName, max_leaves_per_year: maxLeaves },
      authHeader
    );
    setLeaveName("");
    setMaxLeaves(0);
    fetchLeaveTypes();
  };

  const addHoliday = async () => {
    await axios.post(
      "/admin/holidays",
      { name: holidayName, date: holidayDate },
      authHeader
    );
    setHolidayName("");
    setHolidayDate("");
    fetchHolidays();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <h2>Admin Dashboard</h2>

        {/* LEAVE TYPES */}
        <div className="card">
          <h3>Leave Types</h3>
          <input
            placeholder="Leave name"
            value={leaveName}
            onChange={(e) => setLeaveName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max leaves/year"
            value={maxLeaves}
            onChange={(e) => setMaxLeaves(Number(e.target.value))}
          />
          <button onClick={addLeaveType}>Add Leave Type</button>

          <ul>
            {leaveTypes.map((l) => (
              <li key={l.id}>
                {l.name} ({l.max_leaves_per_year})
              </li>
            ))}
          </ul>
        </div>

        {/* HOLIDAYS */}
        <div className="card">
          <h3>Holidays</h3>
          <input
            placeholder="Holiday name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
          />
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
          />
          <button onClick={addHoliday}>Add Holiday</button>

          <ul>
            {holidays.map((h) => (
              <li key={h.id}>
                {h.date} – {h.name}
              </li>
            ))}
          </ul>
        </div>

        {/* MANAGERS */}
        <div className="card">
          <h3>Managers</h3>
          {managers.map((m) => (
            <div key={m.id} className="row">
              {m.name} ({m.email})
              <button onClick={() => deleteUser(m.id)}>Delete</button>
            </div>
          ))}
        </div>

        {/* EMPLOYEES */}
        <div className="card">
          <h3>Employees</h3>
          {employees.map((e) => (
            <div key={e.id} className="row">
              {e.name} ({e.email})
              <button onClick={() => deleteUser(e.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
