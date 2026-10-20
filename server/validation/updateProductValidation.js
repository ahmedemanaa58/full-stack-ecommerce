const joi = require("joi");
const categories = ["Home", "Accessories", "Wellness", "Food","Pet Food"];

exports.updateProductValidation = joi.object({
  title: joi.string().trim().optional(),
  description: joi.string().trim().optional(),
  price: joi.number().min(0).optional(),
  stock: joi.number().min(0).optional(),
  discount: joi.number().min(0).max(100).optional(),
  rating: joi.number().min(0).max(5).optional(),
  category: joi
    .string()
    .valid(...categories)
    .optional(),
});
