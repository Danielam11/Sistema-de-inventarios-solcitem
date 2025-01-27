const express = require("express");
const router = express.Router();
const detalleVentaController = require("../controller/saleDetailController");

// Crear un detalle de venta
router.post("/", detalleVentaController.createDetalleVenta);

// Obtener todos los detalles de venta
router.get("/", detalleVentaController.getAllDetallesVenta);
router.put("/:detalleId", detalleVentaController.updateDetalleVenta);

// Obtener los detalles de una venta por ID de la venta
router.get("/:ventaId", detalleVentaController.getDetallesByVentaId);

// Eliminar un detalle de venta por su ID
router.delete("/:detalleId", detalleVentaController.deleteDetalleVenta);

module.exports = router;
