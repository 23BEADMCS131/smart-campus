import { useState, useEffect, useCallback } from "react";
import { api, STATUSES, formatDate, countBy } from "./api.js";
import { StatusBadge, Stats } from "./components.jsx";

function ComplaintCard({ c, onChange, onDelete }) {
  const [status, setStatus] = useState(c.status);
  const [remark, setRemark] = useState(c.adminRemark || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (newStatus) => {
    setBusy(true); setError("");
    try {
      const updated = await api(`/complaints/${c._id}`, { method: "PATCH", body: { status: newStatus, adminRemark: remark } });
      setStatus(updated.status);
      onChange(updated);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <li className="card">
      <div className="row between">
        <h3>{c.title}</h3>
        <StatusBadge status={c.status} />
      </div>
      <p className="meta">
        {c.category}{c.location && ` · ${c.location}`} · {formatDate(c.createdAt)}
      </p>
      <p className="meta">
        From: <b>{c.student?.name || "Deleted user"}</b>
        {c.student?.rollNumber && ` (${c.student.rollNumber})`}
        {c.student?.email && ` · ${c.student.email}`}
      </p>
      <p>{c.description}</p>
      <div className="manage">
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Note for the student (optional)
          <input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="e.g. Technician assigned" />
        </label>
      </div>
      <p className="error" role="alert">{error}</p>
      <div className="row">
        <button className="btn primary" disabled={busy} onClick={() => save(status)}>Save update</button>
        {c.status !== "Completed" && (
          <button className="btn good" disabled={busy} onClick={() => save("Completed")}>Mark as Completed</button>
        )}
        <button className="btn danger" disabled={busy} onClick={() => onDelete(c._id)}>Delete</button>
      </div>
    </li>
  );
}

export default function AdminDashboard() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setList(await api("/complaints")); } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const replace = (u) => setList((l) => l.map((c) => (c._id === u._id ? u : c)));
  const remove = async (id) => {
    if (!window.confirm("Delete this complaint permanently?")) return;
    try { await api(`/complaints/${id}`, { method: "DELETE" }); setList((l) => l.filter((c) => c._id !== id)); }
    catch (e) { setError(e.message); }
  };

  const q = search.trim().toLowerCase();
  const shown = list.filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      (!q || [c.title, c.category, c.location, c.student?.name, c.student?.email].some((v) => (v || "").toLowerCase().includes(q)))
  );

  return (
    <main>
      <Stats counts={countBy(list)} />
      <div className="toolbar">
        <div className="tabs">
          {["All", ...STATUSES].map((s) => (
            <button key={s} className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, student, category…" aria-label="Search complaints" />
      </div>
      {error && <p className="error">{error}</p>}
      {list.length === 0 ? (
        <p className="empty">No complaints have been submitted yet.</p>
      ) : shown.length === 0 ? (
        <p className="empty">No complaints match this view.</p>
      ) : (
        <ul className="list">
          {shown.map((c) => (
            <ComplaintCard key={c._id + c.updatedAt} c={c} onChange={replace} onDelete={remove} />
          ))}
        </ul>
      )}
    </main>
  );
}
