const detalleVentaModel = require("../model/saleDetailModel");

// Crear un detalle de venta
function createDetalleVenta(req, res) {
  const { ventaId, productoId, cantidadProductos, precioUnitario, subtotal } = req.body;

  detalleVentaModel
    .createDetalleVenta(ventaId, productoId, cantidadProductos, precioUnitario, subtotal)
    .then((detalle) => {
      res.status(201).json({
        message: "Detalle de venta creado exitosamente",
        detalle,
      });
    })
    .catch((error) => {
      console.error("Error al crear el detalle de venta:", error.message);
      res.status(500).json({ error: "Error al crear el detalle de venta" });
    });
}

// Obtener todos los detalles de venta
function getAllDetallesVenta(req, res) {
  detalleVentaModel
    .getAllDetallesVenta()
    .then((detalles) => {
      res.status(200).json(detalles);
    })
    .catch((error) => {
      console.error("Error al obtener los detalles de venta:", error.message);
      res.status(500).json({ error: "Error al obtener los detalles de venta" });
    });
}

// Obtener los detalles de una venta por ID de la venta
function getDetallesByVentaId(req, res) {
  const { ventaId } = req.params;

  detalleVentaModel
    .getDetallesByVentaId(ventaId)
    .then((detalles) => {
      if (detalles.length === 0) {
        return res.status(404).json({ error: "Detalles de venta no encontrados para esta venta" });
      }
      res.status(200).json(detalles);
    })
    .catch((error) => {
      console.error("Error al obtener los detalles de la venta:", error.message);
      res.status(500).json({ error: "Error al obtener los detalles de la venta" });
    });
}

// Eliminar un detalle de venta por su ID
function deleteDetalleVenta(req, res) {
  const { detalleId } = req.params;

  detalleVentaModel
    .deleteDetalleVenta(detalleId)
    .then(() => {
      res.status(200).json({ message: "Detalle de venta eliminado exitosamente" });
    })
    .catch((error) => {
      console.error("Error al eliminar el detalle de venta:", error.message);
      res.status(500).json({ error: "Error al eliminar el detalle de venta" });
    });
}
// Actualizar un detalle de venta por su ID
function updateDetalleVenta(req, res) {
  const { detalleId } = req.params;
  const { productoId, cantidadProductos } = req.body; // Asegúrate de enviar productoId desde el frontend

  detalleVentaModel
    .updateDetalleVenta(detalleId, productoId, cantidadProductos)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.error("Error al actualizar el detalle de venta:", error.message);
      res.status(500).json({ error: "Error al actualizar el detalle de venta" });
    });
}

module.exports = {
  createDetalleVenta,
  getAllDetallesVenta,
  getDetallesByVentaId,
  deleteDetalleVenta,
  updateDetalleVenta
};
