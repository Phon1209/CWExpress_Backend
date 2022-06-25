const router = require("express").Router();
const { check } = require("express-validator");
const validate = require("../middleware/validate");
const { reconnect, blink } = require("../utils/mqtt");

const testTopic = "@msg/TH-CC/PTT-TV/001/task";

router.use((req, res, next) => {
  reconnect();
  next();
});

router.post(
  "/",
  [
    check("amount")
      .not()
      .isEmpty()
      .withMessage("number cannot be empty")
      .isNumeric()
      .withMessage("amount has to be a number"),
  ],
  validate,
  (req, res) => {
    const amount = req.body.amount;

    try {
      blink(testTopic, amount);
      res.json("Request sent");
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Bad Request" });
    }
  }
);

module.exports = router;
