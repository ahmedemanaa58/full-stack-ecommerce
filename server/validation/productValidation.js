const joi = require("joi");

const categories = ["Home", "Accessories", "Wellness", "Food", "Pet Food"];

exports.productValidation = joi.object({
  title: joi.string().trim().required(),
  description: joi.string().trim().required(),
  price: joi.number().min(0).required(),
  stock: joi.number().min(0).required(),
  category: joi
    .string()
    .valid(...categories)
    .required(),
  rating: joi.number().min(0).max(5).default(0),
});
