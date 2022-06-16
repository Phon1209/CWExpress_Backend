const functions = require("firebase-functions");

const CWExpressAPI = require("./app");

exports.CWExpressAPI = functions.https.onRequest(CWExpressAPI);
