import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/DashboardLayout";

type Holiday = {
  id: number;
  date: string;
  name: string;
};

type Leave = {
  id: number;
  leave_type_id: number;
  leave_type?: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
};

type LeaveType = {
  id: number;
  name: string;
  max_leaves_per_year: number;
};

type HistoryResponse = {
  total_leave_days_taken: number;
  history: Array<{
    leave_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
    status: "Pending" | "Approved" | "Rejected" | string;
  }>;
};

export default function EmployeeDashboard() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [leaveTypeId, setLeaveTypeId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [tab, setTab] = useState<"apply" | "myLeaves" | "history" | "holidays">(
    "apply"
  );

  const fetchLeaves = async () => {
    const res = await api.get("/employee/leaves");
    setLeaves(res.data);
  };

  const fetchHistory = async () => {
    const res = await api.get("/employee/leaves/history");
    setHistoryData(res.data);
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get("/employee/leave-types");
      setLeaveTypes(res.data);
    } catch (e) {
      // Leave types fetch failed, but don't block dashboard load
      setLeaveTypes([]);
    }
  };

  const fetchHolidays = async () => {
    const res = await api.get("/employee/holidays");
    setHolidays(res.data);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setMsg("");
      setErr("");
      await Promise.all([fetchLeaves(), fetchHistory(), fetchHolidays()]);
      await fetchLeaveTypes();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to load employee dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const applyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!leaveTypeId || !startDate || !endDate) {
      setErr("Leave Type, Start Date, End Date required ❗");
      return;
    }

    try {
      await api.post("/employee/leaves/apply", {
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
      });

      setMsg("Leave Applied Successfully ✅");
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");

      await fetchLeaves();
      await fetchHistory();
      setTab("myLeaves");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Apply leave failed");
    }
  };

  const cancelLeave = async (leaveId: number) => {
    setMsg("");
    setErr("");
    try {
      await api.delete(`/employee/leaves/${leaveId}`);
      setMsg("Leave Cancelled ✅");
      await fetchLeaves();
      await fetchHistory();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Cancel failed");
    }
  };

  const leaveSummary = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === "Pending").length;
    const approved = leaves.filter((l) => l.status === "Approved").length;
    const rejected = leaves.filter((l) => l.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  return (
    <DashboardLayout
      title="Employee Dashboard"
      subtitle="Apply leave, check holidays & track status"
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

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-2xl shadow">
          <p className="text-gray-400 text-sm">Total Leaves</p>
          <p className="text-2xl font-bold mt-1">{leaveSummary.total}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-2xl shadow">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold mt-1">{leaveSummary.pending}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-2xl shadow">
          <p className="text-gray-400 text-sm">Approved</p>
          <p className="text-2xl font-bold mt-1">{leaveSummary.approved}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-2xl shadow">
          <p className="text-gray-400 text-sm">Rejected</p>
          <p className="text-2xl font-bold mt-1">{leaveSummary.rejected}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 p-4 rounded-2xl shadow flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTab("apply")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            tab === "apply"
              ? "bg-blue-600"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Apply Leave
        </button>

        <button
          onClick={() => setTab("myLeaves")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            tab === "myLeaves"
              ? "bg-blue-600"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          My Leaves
        </button>

        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            tab === "history"
              ? "bg-blue-600"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          History
        </button>

        <button
          onClick={() => setTab("holidays")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            tab === "holidays"
              ? "bg-blue-600"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Holidays
        </button>

        <button
          onClick={fetchAll}
          className="ml-auto px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700"
        >
          Refresh ↻
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <p className="text-gray-400">Loading dashboard...</p>
      ) : (
        <>
          {/* APPLY */}
          {tab === "apply" && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Apply Leave</h2>

              <form onSubmit={applyLeave} className="space-y-3">
                <select
                  className="w-full bg-gray-800 p-3 rounded-xl outline-none"
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value ? parseInt(e.target.value) : "")}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} (Max: {lt.max_leaves_per_year} days/year)
                    </option>
                  ))}
                </select>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Start Date</p>
                    <input
                      type="date"
                      className="w-full bg-gray-800 p-3 rounded-xl outline-none"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">End Date</p>
                    <input
                      type="date"
                      className="w-full bg-gray-800 p-3 rounded-xl outline-none"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <textarea
                  className="w-full bg-gray-800 p-3 rounded-xl outline-none"
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />

                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold">
                  Apply Leave ✅
                </button>
              </form>
            </div>
          )}

          {/* MY LEAVES */}
          {tab === "myLeaves" && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4">My Leaves</h2>

              {leaves.length === 0 ? (
                <p className="text-gray-400">No leaves found</p>
              ) : (
                <div className="space-y-3">
                  {leaves.map((l) => (
                    <div
                      key={l.id}
                      className="bg-gray-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="text-lg font-bold">{l.leave_type || "Leave"}</p>
                        <p className="text-gray-400 text-sm">
                          {l.start_date} → {l.end_date}
                        </p>
                        {l.reason && (
                          <p className="text-gray-400 text-sm mt-1">
                            Reason: {l.reason}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col md:items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm border ${
                            l.status === "Approved"
                              ? "bg-green-600/20 border-green-600 text-green-200"
                              : l.status === "Rejected"
                              ? "bg-red-600/20 border-red-600 text-red-200"
                              : "bg-yellow-600/20 border-yellow-600 text-yellow-200"
                          }`}
                        >
                          {l.status}
                        </span>

                        {l.status === "Pending" && (
                          <button
                            onClick={() => cancelLeave(l.id)}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Leave History</h2>

              {historyData && historyData.total_leave_days_taken > 0 && (
                <p className="text-gray-300 mb-4">
                  Total Leave Days Taken: <b>{historyData.total_leave_days_taken}</b>
                </p>
              )}

              {!historyData || historyData.history.length === 0 ? (
                <p className="text-gray-400">No history found</p>
              ) : (
                <div className="space-y-3">
                  {historyData.history.map((h) => (
                    <div
                      key={h.leave_id}
                      className="bg-gray-800 p-4 rounded-2xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold">{h.leave_type || "Leave"}</p>
                        <p className="text-gray-400 text-sm">
                          {h.start_date} → {h.end_date}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Days: {h.days}</p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${
                          h.status === "Approved"
                            ? "bg-green-600/20 border-green-600 text-green-200"
                            : h.status === "Rejected"
                            ? "bg-red-600/20 border-red-600 text-red-200"
                            : "bg-yellow-600/20 border-yellow-600 text-yellow-200"
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HOLIDAYS */}
          {tab === "holidays" && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Company Holidays</h2>

              {holidays.length === 0 ? (
                <p className="text-gray-400">No holidays found</p>
              ) : (
                <div className="space-y-3">
                  {holidays.map((h) => (
                    <div
                      key={h.id}
                      className="bg-gray-800 p-4 rounded-2xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold">{h.name}</p>
                        <p className="text-gray-400 text-sm">{h.date}</p>
                      </div>
                      <span className="bg-blue-600/20 border border-blue-600 text-blue-200 px-3 py-1 rounded-full text-sm">
                        Holiday
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
