export const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");

export function StatusBadge({ status }) {
  return <span className={"badge " + slug(status)}>{status}</span>;
}

export function Stats({ counts }) {
  const items = [
    ["Total", counts.total, "total"],
    ["Pending", counts.pending, "pending"],
    ["In Progress", counts.progress, "in-progress"],
    ["Completed", counts.completed, "completed"],
  ];
  return (
    <div className="stats">
      {items.map(([label, n, cls]) => (
        <div key={label} className={"stat " + cls}>
          <b>{n}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
