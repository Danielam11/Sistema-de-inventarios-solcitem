const express = require("express");
const brandController = require("../controller/brandController");

const router = express.Router();

router.get("/", brandController.getAll);
router.post("/", brandController.create);
router.get("/:id", brandController.getById);
router.delete("/:id", brandController.remove);

module.exports = router;
