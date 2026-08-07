import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import Header from "../components/Header";
import EmployeeTable from "../components/EmployeeTable";
import AssignTaskModal from "../components/AssignTaskModal";
import CreateEmployeeModal from "../components/CreateEmployeeModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import { Link } from "react-router-dom";
import { DEPARTMENTS } from "../constants/departments";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [offboardingId, setOffboardingId] = useState(null);
  const [successBanner, setSuccessBanner] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDept, setActiveDept] = useState("I_LAB");

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/employees");
      setEmployees(data);
      setError("");
    } catch {
      setError("Couldn't load employees. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  async function handleAssign(payload) {
    await api.post("/admin/assign-task", payload);
    setSuccessBanner(`Task assigned to ${payload.employee_id}.`);
    fetchEmployees();
    setTimeout(() => setSuccessBanner(""), 5000);
  }

  async function handleCreateEmployee(payload) {
    await api.post("/admin/employees", payload);
    setSuccessBanner(`Account created for ${payload.employee_id}.`);
    fetchEmployees();
    setTimeout(() => setSuccessBanner(""), 5000);
  }

  async function handleEditEmployee(payload) {
    const { data } = await api.patch(`/admin/employees/${editingEmployee.employee_id}`, payload);
    setEmployees((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data } : e)));
    setSuccessBanner("Employee updated.");
    setTimeout(() => setSuccessBanner(""), 5000);
  }

  async function handleOffboard(emp) {
    if (!window.confirm(`Move ${emp.full_name} to Others? Their tasks and KPI history stay intact.`)) return;
    setOffboardingId(emp.id);
    try {
      const { data } = await api.post(`/admin/employees/${emp.employee_id}/offboard`);
      setEmployees((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data } : e)));
      setSuccessBanner(`${emp.full_name} moved to Others.`);
      setTimeout(() => setSuccessBanner(""), 5000);
    } catch {
      setError("Couldn't move that employee.");
    } finally {
      setOffboardingId(null);
    }
  }

  const totalTasks = employees.reduce((sum, e) => sum + e.task_count, 0);

  const deptEmployees = employees.filter((e) => e.department === activeDept);
  const filteredEmployees = deptEmployees.filter((emp) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      emp.employee_id.toLowerCase().includes(q) ||
      emp.full_name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-ember-600">Admin</p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Team overview</h1>
            <p className="mt-1 text-sm text-ink-500">
              {employees.length} employee{employees.length === 1 ? "" : "s"} · {totalTasks} task{totalTasks === 1 ? "" : "s"} in the system
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
            <button type="button" onClick={() => setCreateModalOpen(true)} className="transition-base flex-1 rounded-md border border-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-paper sm:flex-none">
              + New employee
            </button>
            <Link to="/admin/kpi" className="transition-base flex-1 rounded-md border border-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-paper sm:flex-none">
              View KPI
            </Link>
            <button type="button" onClick={() => setModalOpen(true)} className="transition-base flex-1 rounded-md border border-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-paper sm:flex-none">
              + Assign task
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successBanner}</div>
        )}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Department tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-ink-50 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DEPARTMENTS.map((d) => {
            const count = employees.filter((e) => e.department === d.value).length;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setActiveDept(d.value)}
                className={`transition-base shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold ${
                  activeDept === d.value ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {d.label} <span className="text-ink-400">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or email…"
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm placeholder:text-ink-400 sm:max-w-xs"
          />
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            hasSearch={searchQuery.trim().length > 0}
            onEdit={setEditingEmployee}
            onOffboard={handleOffboard}
            offboardingId={offboardingId}
          />
        )}
      </main>

      {modalOpen && <AssignTaskModal onClose={() => setModalOpen(false)} onAssign={handleAssign} />}
      {createModalOpen && <CreateEmployeeModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreateEmployee} />}
      {editingEmployee && (
        <EditEmployeeModal employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={handleEditEmployee} />
      )}
    </div>
  );
}