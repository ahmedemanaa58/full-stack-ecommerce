const { Schema, model, Types } = require("mongoose");

//product schema
const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    thumbnail: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Home", "Accessories", "Wellness", "Food", "Pet Food"],
      required: true,
      trim: true,
    },
    image: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    owner: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);
module.exports = model("Product", productSchema);
