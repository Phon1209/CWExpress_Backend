const router = require("express").Router();
const { check } = require("express-validator");
const {
  getMachines,
  addMachine,
  getMachine,
  updateMachine,
  deleteMachine,
} = require("../controllers/machineController");
const validate = require("../middleware/validate");
const provinceJSON = require("../database/province.json");

router
  .route("/")
  .get(getMachines)
  .post(
    [
      check("location")
        .custom((value) => provinceJSON.hasOwnProperty(value))
        .withMessage("Unknown province"),
    ],
    validate,
    addMachine
  );

router
  .route("/:id")
  .get(getMachine)
  .put(
    [
      check("location")
        .custom((value) => {
          if (value === undefined) return true;
          return provinceJSON.hasOwnProperty(value);
        })
        .withMessage("Unknown province"),
    ],
    validate,
    updateMachine
  )
  .delete(deleteMachine);
module.exports = router;
