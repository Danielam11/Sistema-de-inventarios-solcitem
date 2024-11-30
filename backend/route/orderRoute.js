const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.delete("/:id", orderController.deleteOrder);
router.put("/:id", orderController.updateOrder);

module.exports = router;
