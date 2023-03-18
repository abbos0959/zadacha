const express = require("express");
const router = express.Router();
const { Isauthentication } = require("../middleware/IsAuth");

const CourceController = require("../controller/CourceController");

router.route("/create").post(Isauthentication, CourceController.CreateCource);
router.route("/all").get(CourceController.GetAllCource);
router.route("/update/:id").patch(Isauthentication, CourceController.UpdateCource);
router.route("/delete/:id").delete(Isauthentication, CourceController.DeleteCource);
router.route("/single/:id").get(CourceController.GetSingleCource);

module.exports = router;
