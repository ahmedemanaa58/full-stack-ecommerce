const Notification = require("../models/Notification");

exports.findMyNotification = async function (req, res) {
  try {
    //user id
    const user = req.user.id;
    // get notification
    const notifications = await Notification.find({ user });
    return res.status(200).json({ notifications });
  } catch (error) {
    console.log(`DEBUG ERROR >> FIND MY NOTIFCATION ${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};
