export const CATEGORIES = ["Hostel", "Classroom", "Library", "Canteen", "Transport", "Internet / IT", "Sanitation", "Security", "Other"];
export const STATUSES = ["Pending", "In Progress", "Completed"];

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => (t ? localStorage.setItem("token", t) : localStorage.removeItem("token"));

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const formatDate = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const countBy = (list) => ({
  total: list.length,
  pending: list.filter((c) => c.status === "Pending").length,
  progress: list.filter((c) => c.status === "In Progress").length,
  completed: list.filter((c) => c.status === "Completed").length,
});
