const router = require("express").Router();
const { getMachines, addMachine } = require("../controllers/machineController");
router.route("/").get(getMachines).post(addMachine);

module.exports = router;
