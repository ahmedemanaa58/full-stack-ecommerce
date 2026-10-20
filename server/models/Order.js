const { ref } = require("joi");
const { Schema, model, Types } = require("mongoose");

const orderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  },
);
const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processed", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    shippingAddress: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);
module.exports = model("Order", orderSchema);
