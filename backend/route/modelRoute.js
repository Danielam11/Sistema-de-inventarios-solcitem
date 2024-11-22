const express = require("express");
const modelController = require("../controller/modelController");

const router = express.Router();

router.get("/", modelController.getAll);
router.post("/", modelController.create);
router.get("/:id", modelController.getById);
router.delete("/:id", modelController.remove);

module.exports = router;
