const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  // Some error occurs when validate data
  if (!errors.isEmpty()) {
    console.error("Some Error occured while validating data");
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;
