//validate middleware: accept schema and validate it with data

exports.validateMiddleware = function (schema) {
  return function (req, res, next) {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({
        message: error.message,
        errors: error.details.map((err) => err.message),
      });
    req.value = value;
    next();
  };
};
