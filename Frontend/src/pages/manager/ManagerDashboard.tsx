import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../components/DashboardLayout";

type Employee = {
  id: number;
  name: string;
  email: string;
};

type LeaveRequest = {
  id: number;
  employee_id: number;
  leave_type_id: number;
  employee_name?: string;
  leave_type?: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  manager_remark?: string;
};

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [filterMode, setFilterMode] = useState<"all" | "pending">("pending");
  const [search, setSearch] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectRemark, setRejectRemark] = useState("");

  const fetchEmployees = async () => {
    const res = await api.get("/manager/employees");
    setEmployees(res.data);
  };

  const fetchLeavesAll = async () => {
    const res = await api.get("/manager/leaves");
    setLeaves(res.data);
  };

  const fetchLeavesPending = async () => {
    const res = await api.get("/manager/leaves/filter", {
      params: { status: "Pending" },
    });
    setLeaves(res.data);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      setMsg("");

      await fetchEmployees();

      if (filterMode === "pending") await fetchLeavesPending();
      else await fetchLeavesAll();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to load manager dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode]);

  const handleApprove = async (leaveId: number) => {
    try {
      setMsg("");
      setErr("");
      await api.put(`/manager/leaves/${leaveId}/approve`);
      setMsg("Leave Approved ✅");

      setTimeout(async () => {
        if (filterMode === "pending") await fetchLeavesPending();
        else await fetchLeavesAll();
      }, 500);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Approve failed");
    }
  };

  const handleReject = async (leaveId: number) => {
    if (!rejectRemark.trim()) {
      setErr("Remark is required to reject leave");
      return;
    }

    try {
      setMsg("");
      setErr("");
      await api.put(`/manager/leaves/${leaveId}/reject`, {
        manager_remark: rejectRemark,
      });
      setMsg("Leave Rejected ✅");
      setRejectingId(null);
      setRejectRemark("");

      if (filterMode === "pending") await fetchLeavesPending();
      else await fetchLeavesAll();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Reject failed");
    }
  };

  const employeesMap = useMemo(() => {
    const map = new Map<number, Employee>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const emp = employeesMap.get(l.employee_id);
      const employeeName = l.employee_name || emp?.name || "";
      const leaveType = l.leave_type || "";
      const txt = (employeeName + " " + leaveType + " " + l.status)
        .toLowerCase()
        .trim();

      return txt.includes(search.toLowerCase().trim());
    });
  }, [leaves, employeesMap, search]);

  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Approve / Reject employee leave requests"
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

      {/* Filter + Search */}
      <div className="bg-gray-900 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMode("pending")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filterMode === "pending"
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Pending Leaves
          </button>

          <button
            onClick={() => setFilterMode("all")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filterMode === "all"
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            All Leaves
          </button>
        </div>

        <input
          className="w-full md:w-80 bg-gray-800 p-2 rounded-xl outline-none"
          placeholder="Search by employee / type / status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Employees */}
      <div className="bg-gray-900 p-5 rounded-2xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Employees</h2>

        {loading ? (
          <p className="text-gray-400">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="text-gray-400">No employees found</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-gray-800 p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-lg">{emp.name}</p>
                  <p className="text-gray-400 text-sm">{emp.email}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Employee ID: {emp.id}
                  </p>
                </div>

                <span className="bg-blue-600/20 border border-blue-600 text-blue-200 px-3 py-1 rounded-full text-sm">
                  Employee
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaves */}
      <div className="bg-gray-900 p-5 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Leave Requests{" "}
          <span className="text-gray-400 text-sm">({filteredLeaves.length})</span>
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading leaves...</p>
        ) : filteredLeaves.length === 0 ? (
          <p className="text-gray-400">No leave requests found</p>
        ) : (
          <div className="space-y-3">
            {filteredLeaves.map((l) => {
              const emp = employeesMap.get(l.employee_id);
              const employeeName = l.employee_name || emp?.name || "Unknown";

              const statusColor =
                l.status === "Approved"
                  ? "bg-green-600/20 border-green-600 text-green-200"
                  : l.status === "Rejected"
                  ? "bg-red-600/20 border-red-600 text-red-200"
                  : "bg-yellow-600/20 border-yellow-600 text-yellow-200";

              return (
                <div
                  key={l.id}
                  className="bg-gray-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="text-lg font-bold">{employeeName}</p>
                    <p className="text-gray-400 text-sm">
                      {l.start_date} → {l.end_date}
                    </p>

                    {l.leave_type && (
                      <p className="text-gray-300 text-sm mt-1">
                        Type: <b>{l.leave_type}</b>
                      </p>
                    )}

                    {l.reason && (
                      <p className="text-gray-400 text-sm mt-1">
                        Reason: {l.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}
                    >
                      {l.status}
                    </span>

                    {l.manager_remark && (
                      <p className="text-gray-400 text-sm max-w-xs">
                        Remark: {l.manager_remark}
                      </p>
                    )}

                    {l.status === "Pending" ? (
                      <>
                        {rejectingId === l.id ? (
                          <div className="w-full md:w-80 space-y-2">
                            <textarea
                              className="w-full bg-gray-700 text-white p-2 rounded-lg text-sm outline-none"
                              placeholder="Reason for rejection (min 5 chars)"
                              value={rejectRemark}
                              onChange={(e) => setRejectRemark(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReject(l.id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg font-semibold text-sm"
                              >
                                Confirm Reject
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectRemark("");
                                  setErr("");
                                }}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg font-semibold text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(l.id)}
                              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(l.id)}
                              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Action already taken ✅
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
