const router = require("express").Router();

const { authMiddleware } = require("../middlewares/authMiddleware");

const notificationController = require("../controllers/notificationController");

// Get current user's notifications
router.get("/me", authMiddleware, notificationController.findMyNotification);

module.exports = router;
