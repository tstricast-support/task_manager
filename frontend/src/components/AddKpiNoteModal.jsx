import { useState } from "react";

export default function AddKpiNoteModal({ employeeId, onClose, onAdd }) {
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [outcome, setOutcome] = useState("ON_TIME");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onAdd({ entry_date: entryDate, outcome, note: note.trim() || null });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't add that note.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-950/40 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl border border-ink-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-display text-lg font-semibold">Add KPI note</h2>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-900" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            >
              <option value="ON_TIME">On time</option>
              <option value="LATE">Not on time</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">Note (optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Missed the print job deadline"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-md border border-ink-200 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="transition-base rounded-md bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}