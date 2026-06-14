// ============================================
// index.js - Entry Point
// ============================================
// This is where the server starts. It:
//   1. Loads environment variables from .env
//   2. Connects to MongoDB
//   3. Starts the Express server on the given PORT
// ============================================

// Load environment variables FIRST (before anything else uses them)
const dotenv = require("dotenv");
dotenv.config();

// Load express-async-errors to handle throwing inside async routes
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const path = require("path");

// Import database connection helper
const connectDB = require("./config/db");

// Import all API routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");

// ---- Create the Express App ----
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// STEP 1: Connect to MongoDB
// ============================================
// Wait for database to connect before handling requests
connectDB();

// ============================================
// MIDDLEWARE (runs on every incoming request)
// ============================================

// 1. CORS: Allow the React frontend to talk to this backend
app.use(cors());

// 2. Body Parser: Parse incoming JSON request bodies
app.use(express.json({ limit: "10mb" }));

// 3. URL-encoded body parser (for form submissions)
app.use(express.urlencoded({ extended: true }));

// 4. Static files serving for uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (req, res) => {
  res.json({ status: "AI Doubt Solver server is running", timestamp: new Date() });
});

// ============================================
// GLOBAL ERROR HANDLER (must be AFTER routes)
// ============================================
app.use(errorHandler);

// ---- Start Listening for Requests ----
app.listen(PORT, () => {
  console.log(`\n AI Doubt Solver server running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}\n`);
});
