import { useState, useEffect } from "react";
import { api, getToken, setToken } from "./api.js";
import AuthPage from "./AuthPage.jsx";
import StudentPortal from "./StudentPortal.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const status = await api("/auth/setup-status");
        setAdminExists(status.adminExists);
        if (getToken()) {
          try { setUser((await api("/auth/me")).user); } catch { setToken(null); }
        }
      } catch {
        setFatal("Cannot reach the server. Make sure the backend is running.");
      }
      setLoading(false);
    })();
  }, []);

  const handleAuth = ({ token, user }) => {
    setToken(token);
    setUser(user);
    if (user.role === "admin") setAdminExists(true);
  };
  const logout = () => { setToken(null); setUser(null); };

  if (loading) return <p className="center">Loading…</p>;
  if (fatal) return <p className="center error">{fatal}</p>;
  if (!user) return <AuthPage adminExists={adminExists} onAuth={handleAuth} />;

  return (
    <div className="app">
      <header className="nav">
        <div>
          <strong>Smart Campus Complaints</strong>
          <span className="role">{user.role === "admin" ? "Admin Dashboard" : "Student Portal"}</span>
        </div>
        <div className="who">
          <span>{user.name}</span>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>
      {user.role === "admin" ? <AdminDashboard /> : <StudentPortal />}
    </div>
  );
}
