const { Schema, model, Types } = require("mongoose");

//notification schema
const NotificationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
module.exports = model("Notification", NotificationSchema);
