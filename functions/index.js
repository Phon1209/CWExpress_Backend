const functions = require("firebase-functions");
require("dotenv").config();

const CWExpressAPI = require("./app");

exports.CWExpressAPI = functions.https.onRequest(CWExpressAPI);
