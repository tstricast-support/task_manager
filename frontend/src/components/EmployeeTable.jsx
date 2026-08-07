import { useNavigate } from "react-router-dom";

export default function EmployeeTable({ employees, hasSearch, onEdit, onOffboard, offboardingId }) {
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-400">
        {hasSearch ? "No employees match your search." : "No employees in this department yet."}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {employees.map((emp) => (
          <div key={emp.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(`/admin/employee/${emp.employee_id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate font-medium text-ink-900">{emp.full_name}</p>
                <p className="text-xs text-ink-500">{emp.employee_id}</p>
                <p className="truncate text-xs text-ink-400">{emp.email}</p>
              </button>
              <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                {emp.task_count}
              </span>
            </div>
            <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
              <button type="button" onClick={() => onEdit(emp)} className="flex-1 rounded-md border border-ink-200 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900">
                Edit
              </button>
              {emp.department !== "OTHERS" && (
                <button
                  type="button"
                  disabled={offboardingId === emp.id}
                  onClick={() => onOffboard(emp)}
                  className="flex-1 rounded-md border border-red-200 py-1.5 text-xs font-medium text-red-600 hover:border-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  {offboardingId === emp.id ? "…" : "Delete"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3 font-medium">Employee ID</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 text-right font-medium">Tasks</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-ink-100 hover:bg-ember-50/60">
                <td className="cursor-pointer px-5 py-3 font-medium text-ink-900" onClick={() => navigate(`/admin/employee/${emp.employee_id}`)}>
                  {emp.employee_id}
                </td>
                <td className="cursor-pointer px-5 py-3 text-ink-700" onClick={() => navigate(`/admin/employee/${emp.employee_id}`)}>
                  {emp.full_name}
                </td>
                <td className="cursor-pointer px-5 py-3 text-ink-500" onClick={() => navigate(`/admin/employee/${emp.employee_id}`)}>
                  {emp.email}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex items-center justify-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                    {emp.task_count}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => onEdit(emp)} className="text-xs font-medium text-secondary-600 hover:underline">
                      Edit
                    </button>
                    {emp.department !== "OTHERS" && (
                      <button
                        type="button"
                        disabled={offboardingId === emp.id}
                        onClick={() => onOffboard(emp)}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        {offboardingId === emp.id ? "…" : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}