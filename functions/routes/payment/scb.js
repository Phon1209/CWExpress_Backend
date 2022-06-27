const router = require("express").Router();
const { check } = require("express-validator");
const {
  requestQR,
  paymentConfirm,
} = require("../../controllers/scbController");

const validate = require("../../middleware/validate");

// @route   POST  /pay/scb/qr
// @desc    request QR code for payment
// @access  Public
router.post("/qr", requestQR);

// @route   POST  /pay/scb/confirm
// @desc    receive webhook callback from scb
// @access  Public
router.post("/confirm", paymentConfirm);

module.exports = router;
