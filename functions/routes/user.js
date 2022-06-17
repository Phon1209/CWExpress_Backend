const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

// User Schema
const User = require("../database/schema/User");

// @route   POST  /users
// @desc    Register an unauthorized user
// @access  Public
router.post(
  "/",
  [
    check("name", "name is required").not().isEmpty(),
    check("email", "valid email is required").isEmail(),
    check("password", "Please include password").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // Some error occurs when validate data
    if (!errors.isEmpty()) {
      console.error("Some Error occured while validating data");
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from the body of the request (processed by middleware)
    const { name, email, password } = req.body;

    try {
      // Check if user already existed with email
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: `User with email: ${email} already existed` });
      }

      // Create new schema object
      user = new User({
        name,
        email,
        password,
      });

      // Hashing the password
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, salt);

      // Save to the DB
      await user.save();

      // jwt token generate
      // payload = what we want to send back to user
      const payload = {
        user: {
          id: user.id,
          authorized: user.authorized,
        },
      };

      jwt.sign(
        payload,
        process.env.JWTPRIVATEKEY,
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.json(token);
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server has some problem" });
    }
  }
);

module.exports = router;
