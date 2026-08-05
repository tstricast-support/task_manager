import { useState } from "react";

export default function AssignTaskModal({ presetEmployeeId, onClose, onAssign }) {
  const [employeeId, setEmployeeId] = useState(presetEmployeeId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!employeeId.trim() || !title.trim()) {
      setError("Employee ID and title are both required.");
      return;
    }
    if (startTime && endTime && startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onAssign({
        employee_id: employeeId.trim(),
        title: title.trim(),
        description: description.trim() || null,
        start_time: startTime || null,
        end_time: endTime || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't assign that task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink-950/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-ink-100 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Assign a task</h2>
            <p className="mt-0.5 text-sm text-ink-500">
              This shows up instantly on the employee's dashboard.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-900" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Employee ID
            </label>
            <input
              type="text"
              placeholder="EMP101"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={Boolean(presetEmployeeId)}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm disabled:bg-ink-50 disabled:text-ink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Title
            </label>
            <input
              type="text"
              placeholder="Prepare Q3 deck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="For Monday's sync"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-md border border-ink-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
                Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
                End time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="transition-base rounded-md bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Assigning…" : "Assign task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}