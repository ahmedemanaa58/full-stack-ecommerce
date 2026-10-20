exports.roleMiddleware =  function (...roles) {
  return function (req, res, next) {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "unauthorized" });
    //check if role in rules
    if (!roles.includes(role))
      return res.status(403).json({ message: "forbiden" });
    next();
  };
};
