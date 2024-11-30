const express = require("express");
const router = express.Router();
const saleController = require("../controller/saleController");

// Rutas de ventas
router.get("/", saleController.getAllSales); // Obtener todas las ventas
router.post("/", saleController.createSale); // Crear una nueva venta
router.get("/:id", saleController.getSaleById); // Obtener una venta por ID
router.put("/:id", saleController.updateSale);
router.delete("/:id", saleController.deleteSale); // Eliminar una venta

module.exports = router;
