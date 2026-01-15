import { useEffect, useState } from "react";
import api from "../api/axios";

export default function EmployeeDashboard() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  const [leaveTypeId, setLeaveTypeId] = useState<number>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // ---------- LOADERS ----------
  const loadLeaves = async () => {
    const res = await api.get("/employee/leaves");
    setLeaves(res.data);
  };

  const loadHistory = async () => {
    const res = await api.get("/employee/leaves/history");
    setHistory(res.data.history || []);
  };

  const loadHolidays = async () => {
    const res = await api.get("/employee/holidays");
    setHolidays(res.data);
  };

  // ---------- APPLY LEAVE ----------
  const applyLeave = async () => {
    await api.post("/employee/leaves/apply", {
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      reason,
    });

    setStartDate("");
    setEndDate("");
    setReason("");

    loadLeaves();
    loadHistory();
  };

  // ---------- CANCEL LEAVE ----------
  const cancelLeave = async (id: number) => {
    if (!confirm("Cancel this leave?")) return;
    await api.delete(`/employee/leaves/${id}`);
    loadLeaves();
    loadHistory();
  };

  useEffect(() => {
    loadLeaves();
    loadHistory();
    loadHolidays();
  }, []);

  return (
    <div className="page">
      <h2>Employee Dashboard</h2>

      {/* APPLY LEAVE */}
      <h3>Apply Leave</h3>
      <input
        type="number"
        placeholder="Leave Type ID"
        value={leaveTypeId}
        onChange={(e) => setLeaveTypeId(Number(e.target.value))}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <input
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={applyLeave}>Apply</button>

      {/* MY LEAVES */}
      <h3>My Leaves</h3>
      {leaves.map((l) => (
        <p key={l.id}>
          {l.start_date} → {l.end_date} | {l.status}
          {l.status === "Pending" && (
            <button onClick={() => cancelLeave(l.id)}>Cancel</button>
          )}
        </p>
      ))}

      {/* LEAVE HISTORY */}
      <h3>Leave History</h3>
      {history.map((h, i) => (
        <p key={i}>
          {h.leave_type} | {h.start_date} → {h.end_date} | {h.status}
        </p>
      ))}

      {/* HOLIDAYS */}
      <h3>Holidays</h3>
      {holidays.map((h) => (
        <p key={h.id}>
          {h.date} - {h.name}
        </p>
      ))}
    </div>
  );
}
