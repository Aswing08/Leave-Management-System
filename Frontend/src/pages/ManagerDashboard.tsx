import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  // Load all employees
  const loadEmployees = async () => {
    const res = await api.get("/manager/employees");
    setEmployees(res.data);
  };

  // Load all leaves
  const loadLeaves = async () => {
    const res = await api.get("/manager/leaves");
    setLeaves(res.data);
  };

  // Filter leaves
  const filterLeaves = async () => {
    const res = await api.get("/manager/leaves/filter", {
      params: { status: statusFilter },
    });
    setLeaves(res.data);
  };

  // Approve leave
  const approveLeave = async (id: number) => {
    await api.put(`/manager/leaves/${id}/approve`);
    loadLeaves();
  };

  // Reject leave
  const rejectLeave = async (id: number) => {
    await api.put(`/manager/leaves/${id}/reject`, {
      manager_remark: "Rejected by manager",
    });
    loadLeaves();
  };

  useEffect(() => {
    loadEmployees();
    loadLeaves();
  }, []);

  return (
    <div className="page">
      <h2>Manager Dashboard</h2>

      {/* EMPLOYEES */}
      <h3>Employees</h3>
      {employees.map((emp) => (
        <p key={emp.id}>
          {emp.name} ({emp.email})
        </p>
      ))}

      {/* FILTER */}
      <h3>Filter Leaves</h3>
      <select onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
      <button onClick={filterLeaves}>Filter</button>

      {/* LEAVES */}
      <h3>Leave Requests</h3>
      {leaves.map((leave) => (
        <div key={leave.id} style={{ borderBottom: "1px solid #ccc" }}>
          <p>
            Employee ID: {leave.employee_id} <br />
            {leave.start_date} → {leave.end_date} <br />
            Reason: {leave.reason} <br />
            Status: {leave.status}
          </p>

          {leave.status === "Pending" && (
            <>
              <button onClick={() => approveLeave(leave.id)}>Approve</button>
              <button onClick={() => rejectLeave(leave.id)}>Reject</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
