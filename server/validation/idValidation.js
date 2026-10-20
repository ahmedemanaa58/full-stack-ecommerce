const joi = require("joi");
exports.idValidatorSchema = joi.string().length(24).hex().required();
