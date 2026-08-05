import StatusPill from "./StatusPill";

export default function TaskRow({ task, index, onToggleStatus, toggling, onDelete, deleting }) {
  const isCompleted = task.status === "COMPLETED";

  return (
    // after
  <li className="group flex flex-col gap-3 border-b border-ink-100 py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <span className="mt-0.5 w-6 shrink-0 font-display text-xs text-ink-400">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-medium leading-snug ${isCompleted ? "text-ink-400 line-through" : "text-ink-900"}`}>
            {task.title}
          </h3>
          <StatusPill status={task.status} />
        </div>
        {task.description && <p className="mt-1 text-sm text-ink-500">{task.description}</p>}

        {(task.start_time || task.end_time) && (
          <p className="mt-1 text-xs font-medium text-secondary-600">
            🕒 {task.start_time || "?"} – {task.end_time || "?"}
          </p>
        )}

        <p className="mt-1 text-xs text-ink-400">
          Created {new Date(task.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      
      <div className="flex shrink-0 flex-row gap-2 pl-10 sm:flex-col sm:items-end sm:pl-0">
        <button
          type="button"
          disabled={toggling}
          onClick={() => onToggleStatus(task)}
          className={`transition-base rounded-md border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
            isCompleted
              ? "border-ink-200 text-ink-600 hover:border-ink-900 hover:text-ink-900"
              : "border-ink-900 bg-ink-900 text-paper hover:bg-ink-700"
          }`}
        >
          {toggling ? "…" : isCompleted ? "Reopen" : "Mark done"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(task)}
          className="transition-base rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </li>
  );
}