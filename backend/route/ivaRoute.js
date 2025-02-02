// routes/IVARoutes.js
const express = require("express");
const router = express.Router();
const IVAController = require("../controller/ivaController");

router.get("/", IVAController.getAll);
router.post("/", IVAController.create);
router.get("/:id", IVAController.getById);
router.delete("/:id", IVAController.remove);

module.exports = router;