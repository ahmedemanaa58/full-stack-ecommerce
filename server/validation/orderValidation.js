const joi = require("joi");
exports.createOrderSchema = joi.object({
  items: joi
    .array()
    .items(
      joi.object({
        product: joi.string().length(24).hex().required(),
        quantity: joi.number().min(1).required(),
      }),
    )
    .min(1)
    .required(),
  shippingAddress: joi.string().trim().required(),
  notes: joi.string().trim().optional(),
});
exports.updateOrderStatusSchema = joi.object({
  status: joi
    .string()
    .valid(
      "pending",
      "processed",
      "shipped",
      "delivered",
      "canceled",
      "cancelled",
    )
    .required(),
});
