const { v4: uuid } = require("uuid");
const request = require("request");
const path = require("path");

const Order = require("../database/schema/Order");
const { refIDGenerator } = require("../utils/banking");
const { createTempfile } = require("../utils/file");
const { topicPath, blink } = require("../utils/mqtt");
const sse = require("../sse/sse");

//---------------------------------------------

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

//---------------------------------------------

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
  var imagePath = path.join(__dirname, "..", "temp", "QR", orderID) + ".png";

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

//---------------------------------------------

const checkOrder = (potentialOrder, amount) => {
  if (potentialOrder) {
    if (potentialOrder.amount != amount)
      throw new Error(
        `Amount mismatched: detected ${amount}, needs ${potentialOrder.amount}`
      );
    if (potentialOrder.status !== "ACTIVE")
      throw new Error("Order is not fulfilled: status is not active");
  } else throw new Error("Order not found");
};

const retrieveOrder = async (refs, amount) => {
  try {
    const potentialOrder = await Order.findOne({ ...refs });
    checkOrder(potentialOrder, amount);

    return potentialOrder;
  } catch (err) {
    throw err;
  }
};

const verifyTransaction = async (
  accessToken,
  transactionId,
  payeeAccountNumber,
  refs
) => {
  verifyOptions = {
    method: "GET",
    url: `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/transactions/${transactionId}?sendingBank=014`,
    headers: {
      "accept-language": "EN",
      authorization: `Bearer ${accessToken}`,
      requestUID: uuid(),
      resourceOwnerID: process.env.SCB_API_KEY,
    },
    json: true,
  };

  try {
    const transactionData = await new Promise((resolve, reject) => {
      request(verifyOptions, (err, res, body) => {
        if (err || res.statusCode !== 200) {
          reject(new Error("Corrupted Order"));
          return;
        } else resolve(body);
      });
    });

    const { ref1, ref2 } = refs;

    if (transactionData.data.receiver.account.value !== payeeAccountNumber)
      throw new Error("Corrupted Order");
    if (transactionData.data.ref1 !== ref1) throw new Error("Corrupted Order");
    if (transactionData.data.ref2 !== ref2) throw new Error("Corrupted Order");
  } catch (err) {
    throw err;
  }
};

//---------------------------------------------

// @route   POST  /pay/scb/qr
// @desc    request QR code for payment
// @access  Public
const requestQR = async (req, res) => {
  const { amount } = req.body;
  let { machineID } = req.body;
  if (machineID == undefined) machineID = 0;
  let refs = {
    ref1: refIDGenerator(10),
    ref2: refIDGenerator(10),
  };

  console.log(refs);
  let newOrder;
  let base64QR;

  try {
    // Check if there's ACTIVE order currently match the requested one
    const oldOrder = await Order.findOne({
      status: "ACTIVE",
      amount,
      machineID,
    });
    console.log(oldOrder);
    if (oldOrder !== null) {
      // Use old order instead
      newOrder = oldOrder;
      refs = { ref1: oldOrder.ref1, ref2: oldOrder.ref2 };
    } else {
      // populate order into database
      newOrder = await createOrder(refs, amount, machineID);
    }

    const orderID = newOrder.id;
    // Request token from SCB
    const accessToken = await getBankAccessToken();

    // Request QR file from SCB
    base64QR = await getQRPayment(accessToken, amount, refs, orderID);

    return res.json({ base64QR, refs, amount });
  } catch (err) {
    // Delete order from DB if has any error
    if (newOrder !== undefined) Order.findOneAndDelete({ _id: newOrder._id });

    console.error(err);
    return res.status(500).json({ error: "Service not available" });
  }
};

// @route   POST  /pay/scb/confirm
// @desc    receive webhook callback from scb
// @access  Public
const paymentConfirm = async (req, res) => {
  const {
    amount,
    payeeAccountNumber,
    transactionId,
    transactionDateandTime,
    billPaymentRef1,
    billPaymentRef2,
    billPaymentRef3,
    bypass,
  } = req.body;

  try {
    if (bypass !== true) {
      // check with the database for order
      const order = await retrieveOrder(
        { ref1: billPaymentRef1, ref2: billPaymentRef2 },
        amount
      );
      if (billPaymentRef3 !== "CWEX")
        return res.status(401).json({ error: "Invalid Reference(s)" });

      // Check with SCB api
      try {
        const accessToken = await getBankAccessToken();
        await verifyTransaction(
          accessToken,
          transactionId,
          payeeAccountNumber,
          {
            ref1: billPaymentRef1,
            ref2: billPaymentRef2,
          }
        );
      } catch (err) {
        throw err;
      }

      // Change status of the order
      order.status = "COMPLETED";
      // add transactionID and transactionDateandTime to order for future reference
      order.fulfilledAt = new Date(transactionDateandTime);
      order.transactionID = transactionId;
      await order.save();

      // call mqtt
      const machineID = parseInt(order.machineID);
      let topic;
      if (machineID == 0) topic = "@msg/TH-CC/PTT-TV/001/task";
      else topic = await topicPath(machineID);
      blink(topic, amount);
    } else {
      console.log("Bypassing...");
      blink("@msg/TH-CC/PTT-TV/001/task", amount);
    }

    // send event back to client
    sse.send({
      ref1: billPaymentRef1,
      ref2: billPaymentRef2,
      ref3: billPaymentRef3,
      amount,
      machineID: 2,
    });

    res.status(200).json({
      msg: "Transaction Complete",
      cmd: `Blinking on ${amount}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: err.message });
  }
};

module.exports = {
  requestQR,
  paymentConfirm,
};
