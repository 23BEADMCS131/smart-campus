import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// In production, serve the built React app from the same server
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error. Please try again." });
});

const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!MONGO_URI || !JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
// One connection pool is created here and reused by every request.
// Pool size is left at the driver default: this app is a single long-running
// server with light, short queries, so no tuning is needed.
mongoose
  .connect(MONGO_URI, {
    // Fail within 5 seconds with a clear error instead of hanging if the
    // database is unreachable (wrong URI, IP not allowed, MongoDB not running).
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    console.error("Check: 1) MONGO_URI in server/.env  2) MongoDB is running (local) or your IP is allowed (Atlas)  3) username and password are correct");
    process.exit(1);
  });

// Close the connection cleanly when the server stops (Ctrl+C)
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
