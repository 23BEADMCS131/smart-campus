import mongoose from "mongoose";

export const CATEGORIES = ["Hostel", "Classroom", "Library", "Canteen", "Transport", "Internet / IT", "Sanitation", "Security", "Other"];
export const STATUSES = ["Pending", "In Progress", "Completed"];

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: CATEGORIES, required: true },
    location: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: STATUSES, default: "Pending" },
    adminRemark: { type: String, trim: true, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
