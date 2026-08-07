import { useState } from "react";
import { DEPARTMENTS } from "../constants/departments";

export default function EditEmployeeModal({ employee, onClose, onSave }) {
  const [fullName, setFullName] = useState(employee.full_name);
  const [email, setEmail] = useState(employee.email);
  const [role, setRole] = useState(employee.role);
  const [department, setDepartment] = useState(employee.department);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSave({ full_name: fullName.trim(), email: email.trim(), role, department });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-950/40 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl border border-ink-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Edit employee</h2>
            <p className="mt-0.5 text-sm text-ink-500">{employee.employee_id}</p>
          </div>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-900" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Full name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm">
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm">
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900">Cancel</button>
            <button type="submit" disabled={submitting} className="transition-base rounded-md bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}