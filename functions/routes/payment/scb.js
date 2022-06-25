const router = require("express").Router();
const { check } = require("express-validator");
const { v4: uuid } = require("uuid");
const request = require("request");
const path = require("path");

const validate = require("../../middleware/validate");
const Order = require("../../database/schema/Order");
const { refIDGenerator } = require("../../utils/banking");
const { createTempfile } = require("../../utils/file");
const { topicPath, blink } = require("../../utils/mqtt");

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
const getQRPayment = (accessToken, amount, refs, orderID) => {
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
      ...refs,
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
  var imagePath =
    path.join(__dirname, "..", "..", "temp", "QR", orderID) + ".png";

  createTempfile(imagePath, buffer, 30);

  return imagePath;
};

const createOrder = async (refs, amount, machineID) => {
  try {
    const newOrder = new Order({
      status: "ACTIVE",
      ...refs,
      amount,
      machineID,
    });

    return await newOrder.save();
  } catch (err) {
    throw err;
  }
};

// @route   POST  /pay/scb/qr
// @desc    request QR code for payment
// @access  Public
router.post("/qr", async (req, res) => {
  const { amount, machineID } = req.body;
  const refs = {
    ref1: refIDGenerator(20),
    ref2: refIDGenerator(20),
  };

  console.log(refs);
  let newOrder;

  try {
    // populate order into database
    newOrder = await createOrder(refs, amount, machineID);
    const orderID = newOrder.id;

    // Request token from SCB
    const accessToken = await getBankAccessToken();

    // Request QR file from SCB
    const base64QR = await getQRPayment(accessToken, amount, refs, orderID);
    const imagePath = createTempQR(base64QR.qrImage, orderID);

    // send file back as a response
    return res.sendFile(imagePath);
  } catch (err) {
    // Delete order from DB if has any error
    if (newOrder !== null) Order.findOneAndDelete({ _id: newOrder._id });

    console.error(err);
    return res.status(500).json({ error: "Service not available" });
  }
});

const checkOrder = (potentialOrder, amount) => {
  if (potentialOrder) {
    if (potentialOrder.amount !== amount) throw new Error("Amount mismatched");
    if (potentialOrder.status !== "ACTIVE")
      throw new Error("Order is not fulfilled");
  } else throw new Error("Order not found");
};

const getPaidMachine = async (refs, amount) => {
  try {
    const potentialOrder = await Order.findOne({ ...refs });
    checkOrder(potentialOrder, amount);

    // Change status of the order
    potentialOrder.status = "COMPLETED";
    await potentialOrder.save();
    return potentialOrder.machineID;
  } catch (err) {
    throw err;
  }
};

// @route   POST  /pay/scb/confirm
// @desc    receive webhook callback from scb
// @access  Public
router.post("/confirm", async (req, res) => {
  const {
    amount,
    payeeAccountNumber,
    transactionId,
    transactionDateandTime,
    billPaymentRef1,
    billPaymentRef2,
    billPaymentRef3,
  } = req.body;

  try {
    // check with the database for order
    const machineID = await getPaidMachine(
      { ref1: billPaymentRef1, ref2: billPaymentRef2 },
      amount
    );
    if (billPaymentRef3 !== "CWEX") throw new Error("Corrupted Order");

    // @TODO: Check with SCB api

    // call mqtt
    // const topic = await topicPath(machineID);
    // blink(topic, amount);

    res.status(200).json({
      msg: "Transaction Complete",
      cmd: `Blinking on ${amount}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
