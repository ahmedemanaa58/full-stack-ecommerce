const { idValidatorSchema } = require("../validation/idValidation");
exports.idValidatorMiddleware = function (req, res, next) {
  const id = req.params.id;

  //check validation
  const { error } = idValidatorSchema.validate(id);
  //check error
  if (error) {
    return res.status(400).json({ message: "invlid format!" });
  }
  next();
};
