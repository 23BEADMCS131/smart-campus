import { useState, useEffect, useCallback } from "react";
import { api, CATEGORIES, formatDate, countBy } from "./api.js";
import { StatusBadge, Stats } from "./components.jsx";

const empty = { title: "", category: "", location: "", description: "" };

export default function StudentPortal() {
  const [tab, setTab] = useState("new");
  const [form, setForm] = useState(empty);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setList(await api("/complaints/mine")); } catch (e) { setError(e.message); }
  }, []);

  // Load now, then refresh every 20 seconds so status updates appear automatically
  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    try {
      await api("/complaints", { method: "POST", body: form });
      setForm(empty);
      setNotice("Complaint submitted. You can track it under “My complaints”.");
      await load();
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <main>
      <div className="tabs">
        <button className={tab === "new" ? "on" : ""} onClick={() => setTab("new")}>New complaint</button>
        <button className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>My complaints ({list.length})</button>
      </div>

      {tab === "new" && (
        <form className="card" onSubmit={submit}>
          <h2>Submit a complaint</h2>
          <label>Title<input value={form.title} onChange={set("title")} placeholder="Short summary of the problem" maxLength={120} /></label>
          <div className="two">
            <label>Category
              <select value={form.category} onChange={set("category")}>
                <option value="">Choose a category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Location (optional)<input value={form.location} onChange={set("location")} placeholder="e.g. Block B, Room 204" /></label>
          </div>
          <label>Description<textarea rows={5} value={form.description} onChange={set("description")} placeholder="Explain what is wrong and since when" maxLength={2000} /></label>
          <p className="error" role="alert">{error}</p>
          {notice && <p className="ok" role="status">{notice}</p>}
          <button className="btn primary" disabled={busy}>{busy ? "Submitting…" : "Submit complaint"}</button>
        </form>
      )}

      {tab === "mine" && (
        <>
          <Stats counts={countBy(list)} />
          {error && <p className="error">{error}</p>}
          {list.length === 0 ? (
            <p className="empty">You have not submitted any complaints yet.</p>
          ) : (
            <ul className="list">
              {list.map((c) => (
                <li key={c._id} className="card">
                  <div className="row between">
                    <h3>{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="meta">{c.category}{c.location && ` · ${c.location}`} · Submitted {formatDate(c.createdAt)}</p>
                  <p>{c.description}</p>
                  {c.adminRemark && <p className="remark"><b>Admin note:</b> {c.adminRemark}</p>}
                  {c.status === "Completed" && c.resolvedAt && <p className="ok">Resolved on {formatDate(c.resolvedAt)}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
