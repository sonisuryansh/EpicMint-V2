import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import aiRouter from "./routes/ai.js";
import submissionsRouter from "./routes/submissions.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: "*", // Allow all origins for dev ease, or specify process.env.FRONTEND_URL
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser
app.use(express.json());

// Mount routers
app.use("/api", aiRouter);
app.use("/api", submissionsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 EpicMint Backend Server running on port ${PORT}`);
});
