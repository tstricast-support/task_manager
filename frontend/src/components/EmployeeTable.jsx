import { useNavigate } from "react-router-dom";

export default function EmployeeTable({ employees, hasSearch }) {
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-400">
        {hasSearch ? "No employees match your search." : "No employees found yet."}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {employees.map((emp) => (
          <button
            key={emp.id}
            type="button"
            onClick={() => navigate(`/admin/employee/${emp.employee_id}`)}
            className="transition-base flex w-full items-center justify-between rounded-xl border border-ink-100 bg-white p-4 text-left shadow-sm active:bg-ember-50/60"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{emp.full_name}</p>
              <p className="text-xs text-ink-500">{emp.employee_id}</p>
              <p className="truncate text-xs text-ink-400">{emp.email}</p>
            </div>
            <span className="ml-3 shrink-0 inline-flex items-center justify-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
              {emp.task_count}
            </span>
          </button>
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
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => navigate(`/admin/employee/${emp.employee_id}`)}
                className="transition-base cursor-pointer border-t border-ink-100 hover:bg-ember-50/60"
              >
                <td className="px-5 py-3 font-medium text-ink-900">{emp.employee_id}</td>
                <td className="px-5 py-3 text-ink-700">{emp.full_name}</td>
                <td className="px-5 py-3 text-ink-500">{emp.email}</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex items-center justify-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                    {emp.task_count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}