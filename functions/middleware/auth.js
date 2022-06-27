const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const payload = jwt.verify(token, process.env.JWTPRIVATEKEY);
    if (!payload.user.authorized) throw { message: "Unauthorized Access" };

    res.locals.user = payload.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};
