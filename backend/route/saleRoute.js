const express = require("express");
const router = express.Router();
const saleController = require("../controller/saleController");
const authenticateToken = require("../middleware/authenticateToken");

// Rutas de ventas
router.get("/", saleController.getAllSales); // Obtener todas las ventas
router.post("/", authenticateToken, saleController.createSale);
router.get("/:id", saleController.getSaleById); // Obtener una venta por ID
router.put("/:id", saleController.updateSale);
router.delete("/:id", saleController.deleteSale); // Eliminar una venta

module.exports = router;
