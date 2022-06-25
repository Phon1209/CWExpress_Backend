const router = require("express").Router();
const { check } = require("express-validator");
const { v4: uuid } = require("uuid");
const request = require("request");
const fs = require("fs");
const path = require("path");

const validate = require("../../middleware/validate");
const Order = require("../../database/schema/Order");

const getBankAccessToken = () => {
  const uid = uuid();

  const requestTokenOptions = {
    method: "POST",
    url: "https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token",
    headers: {
      "Content-Type": "application/json",
      resourceOwnerId: process.env.SCB_API_KEY,
      requestUId: uid,
      "accept-language": "EN",
    },
    body: {
      applicationKey: process.env.SCB_API_KEY,
      applicationSecret: process.env.SCB_API_SECRET,
    },
    json: true,
  };
  return new Promise((resolve, reject) => {
    request(requestTokenOptions, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        reject(body.status);
        return;
      }
      resolve(body.data.accessToken);
    });
  });
};

// request base64 QRcode image from scb
const getQRPayment = (accessToken, amount, ref1, ref2, orderID) => {
  QROptions = {
    method: "POST",
    url:
      "https://api-sandbox.partners.scb/partners/sandbox/v1/payment/qrcode/create",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + accessToken,
      resourceOwnerId: process.env.SCB_API_KEY,
      requestUId: orderID,
      "accept-language": "EN",
    },
    body: {
      qrType: "PP",
      ppType: "BILLERID",
      ppId: process.env.SCB_BILLER_ID,
      amount,
      ref1,
      ref2,
      ref3: "CWEX",
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request(QROptions, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        reject(body.status);
        return;
      }
      resolve(body.data);
    });
  });
};

const createTempQR = (base64QR, orderID) => {
  // Reads file in form buffer => <Buffer ff d8 ff db 00 43 00 ...
  const buffer = Buffer.from(base64QR, "base64");
  // Pipes an image with relative path to "temp" folder
  var imagePath = path.join(__dirname, "..", "..", "temp", "QR");
  fs.writeFileSync(imagePath + orderID + ".png", buffer);

  // delete an image after 30 secs
  setTimeout(() => {
    fs.unlink(imagePath + orderID + ".png", (err) => {
      if (err) throw err;
    });

    await newOrder.save();
  } catch (err) {
    throw err;
  }
};

// @route   POST  /pay/scb/qr
// @desc    request QR code for payment
// @access  Public
router.post("/qr", async (req, res) => {
  const { amount, machineID } = req.body;
  const orderID = uuid();

  try {
    const accessToken = await getBankAccessToken();
    const base64QR = await getQRPayment(
      accessToken,
      amount,
      "REFERENCE1",
      "REFERENCE2",
      orderID
    );

    createTempQR(base64QR.qrImage, orderID);

    // send file back as a response
    return res.sendFile(imagePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Service not available" });
  }
});

module.exports = router;
