const STYLES = {
  PENDING: "bg-ember-50 text-ember-700 border-ember-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-ink-100 text-ink-600 border-ink-200"
      }`}
    >
      {status === "COMPLETED" ? "Completed" : "Pending"}
    </span>
  );
}
