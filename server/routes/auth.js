import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, rollNumber: u.rollNumber });
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

async function createAccount(req, res, role) {
  try {
    const { name, email, password, rollNumber } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Please enter your name." });
    if (!emailOk(email)) return res.status(400).json({ message: "Please enter a valid email." });
    if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(409).json({ message: "This email is already registered." });
    const user = await User.create({
      name, email, role,
      rollNumber: role === "student" ? rollNumber || "" : "",
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create the account." });
  }
}

// Tells the app whether the one-time admin setup is still needed
router.get("/setup-status", async (req, res) => {
  res.json({ adminExists: !!(await User.exists({ role: "admin" })) });
});

router.post("/register", (req, res) => createAccount(req, res, "student"));

// Works only while no admin exists. After the first admin is created it is closed.
router.post("/setup-admin", async (req, res) => {
  if (await User.exists({ role: "admin" }))
    return res.status(403).json({ message: "Admin setup is already complete." });
  createAccount(req, res, "admin");
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(401).json({ message: "Incorrect email or password." });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
