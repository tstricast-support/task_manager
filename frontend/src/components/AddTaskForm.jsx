import { useState } from "react";

export default function AddTaskForm({ onSubmit, submitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title first.");
      return;
    }
    if (startTime && endTime && startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      start_time: startTime || null,
      end_time: endTime || null,
    });
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm"
    >
      <h2 className="font-display text-base font-semibold">Add a task</h2>
      <p className="mt-1 text-sm text-ink-500">
        Log something you're working on today. It's added straight to your list.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm placeholder:text-ink-400"
        />
        <textarea
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-ink-200 px-3 py-2 text-sm placeholder:text-ink-400"
        />
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
        <button
          type="submit"
          disabled={submitting}
          className="transition-base w-full rounded-md bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}