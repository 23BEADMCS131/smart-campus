import { useState } from "react";
import { api } from "./api.js";

export default function AuthPage({ adminExists, onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup | setup
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const switchMode = (m) => { setMode(m); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const path = mode === "login" ? "/auth/login" : mode === "signup" ? "/auth/register" : "/auth/setup-admin";
      onAuth(await api(path, { method: "POST", body: form }));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const titles = { login: "Log in", signup: "Student sign up", setup: "Create the admin account" };

  return (
    <div className="auth">
      <h1>Smart Campus Complaints</h1>
      <p className="muted">Report campus problems and track them until they are fixed.</p>
      <div className="card">
        <div className="tabs">
          <button className={mode === "login" ? "on" : ""} onClick={() => switchMode("login")}>Log in</button>
          <button className={mode === "signup" ? "on" : ""} onClick={() => switchMode("signup")}>Student sign up</button>
          {!adminExists && <button className={mode === "setup" ? "on" : ""} onClick={() => switchMode("setup")}>Admin setup</button>}
        </div>
        <h2>{titles[mode]}</h2>
        {mode === "login" && <p className="muted">Students and admins both log in here.</p>}
        {mode === "setup" && <p className="muted">No admin exists yet. The first account created here becomes the admin. This option disappears afterwards.</p>}
        <form onSubmit={submit}>
          {mode !== "login" && (
            <label>Full name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
          )}
          {mode === "signup" && (
            <label>Roll number (optional)<input value={form.rollNumber} onChange={set("rollNumber")} /></label>
          )}
          <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
          <label>Password<input type="password" value={form.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          <p className="error" role="alert">{error}</p>
          <button className="btn primary" disabled={busy}>{busy ? "Please wait…" : titles[mode]}</button>
        </form>
      </div>
    </div>
  );
}
