// Import
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Auth Middleware
exports.authMiddleware = async function (req, res, next) {
  try {
    // Get Auth Header
    const auth = req.headers["authorization"];
    if (!auth) return res.status(401).json({ message: "Unauthorized" });

    // Get Token
    const [type, token] = auth.split(" ");
    if (type !== "Bearer" || !token)
      return res.status(401).json({ message: "Unauthorized" });

    // Verify
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Find Current User
    const currentUser = await User.findById(payload.id).select("-password");
    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    // Attach User
    req.user = currentUser;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
