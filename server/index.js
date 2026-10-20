// 1. Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { default: rateLimit } = require("express-rate-limit");
const http = require("http");
const path = require("path");

const { connectToDatabase } = require("./config/dbconfig");
const { initSocket } = require("./services/socket.js");

// Configuration
const PORT = process.env.PORT || 8080;

// Initialize Express App and HTTP Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Enable CORS
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

// Standard body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
app.use(
  rateLimit({
    limit: 1000,
    windowMs: 1000 * 60 * 60 * 24, // 24 hours
  }),
);

// Serve static uploaded files safely
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/products", require("./routes/productRoutes.js"));
app.use("/api/order", require("./routes/orderRoutes.js"));
app.use("/api/notifications", require("./routes/notificationRoutes.js"));

// Health check route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start Server
server.listen(PORT, function () {
  console.log(`Server running at port: ${PORT}`);
  connectToDatabase();
});
