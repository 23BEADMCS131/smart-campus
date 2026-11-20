import { Router } from "express";
import Complaint, { CATEGORIES, STATUSES } from "../models/Complaint.js";
import { protect, only } from "../middleware/auth.js";

const router = Router();
router.use(protect);

// STUDENT: create a complaint
router.post("/", only("student"), async (req, res) => {
  try {
    const { title, category, location, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Please enter a title." });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: "Please choose a category." });
    if (!description?.trim()) return res.status(400).json({ message: "Please describe the problem." });
    const complaint = await Complaint.create({ student: req.user._id, title, category, location, description });
    res.status(201).json(complaint);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not submit the complaint." });
  }
});

// STUDENT: list my complaints
router.get("/mine", only("student"), async (req, res) => {
  res.json(await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 }));
});

// ADMIN: list all complaints
router.get("/", only("admin"), async (req, res) => {
  res.json(await Complaint.find().sort({ createdAt: -1 }).populate("student", "name email rollNumber"));
});

// ADMIN: update status and remark
router.patch("/:id", only("admin"), async (req, res) => {
  try {
    const { status, adminRemark } = req.body;
    if (status && !STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status." });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    if (status) {
      complaint.status = status;
      complaint.resolvedAt = status === "Completed" ? new Date() : null;
    }
    if (typeof adminRemark === "string") complaint.adminRemark = adminRemark;
    await complaint.save();
    res.json(await complaint.populate("student", "name email rollNumber"));
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Could not update the complaint." });
  }
});

// ADMIN: delete a complaint
router.delete("/:id", only("admin"), async (req, res) => {
  try {
    const gone = await Complaint.findByIdAndDelete(req.params.id);
    if (!gone) return res.status(404).json({ message: "Complaint not found." });
    res.json({ message: "Deleted." });
  } catch {
    res.status(400).json({ message: "Could not delete the complaint." });
  }
});

export default router;
