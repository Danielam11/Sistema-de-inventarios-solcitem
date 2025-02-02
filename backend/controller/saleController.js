const salesModel = require("../model/saleModel");

// Crear una nueva venta
function createSale(req, res) {
  const { clienteId, total, subtotal } = req.body; // Ya no recibimos usuarioId desde el body
  const usuarioId = req.user.userId; // Obtener el usuarioId desde el token

  // Validar que el clienteId sea un número válido
  if (!clienteId || isNaN(clienteId)) {
    return res.status(400).json({ error: "El ID de cliente no es válido." });
  }

  salesModel
    .createSale(clienteId, usuarioId, total, subtotal)
    .then((sale) => {
      res.status(201).json({
        message: "Venta creada exitosamente",
        sale,
      });
    })
    .catch((error) => {
      console.error("Error al crear la venta:", error.message);
      res.status(500).json({ error: "Error al crear la venta" });
    });
}
// Obtener todas las ventas
function getAllSales(req, res) {
  salesModel
    .getAllSales()
    .then((sales) => {
      res.status(200).json(sales);
    })
    .catch((error) => {
      console.error("Error al obtener las ventas:", error.message);
      res.status(500).json({ error: "Error al obtener las ventas" });
    });
}

// Obtener una venta por ID
function getSaleById(req, res) {
  const { id } = req.params;

  salesModel
    .getSaleById(id)
    .then((sale) => {
      if (!sale) {
        return res.status(404).json({ error: "Venta no encontrada" });
      }
      res.status(200).json(sale);
    })
    .catch((error) => {
      console.error("Error al obtener la venta:", error.message);
      res.status(500).json({ error: "Error al obtener la venta" });
    });
}

// Eliminar una venta
function deleteSale(req, res) {
  const { id } = req.params;

  salesModel
    .deleteSale(id)
    .then(() => {
      res.status(200).json({ message: "Venta eliminada exitosamente" });
    })
    .catch((error) => {
      console.error("Error al eliminar la venta:", error.message);
      res.status(500).json({ error: "Error al eliminar la venta" });
    });
}

// Actualizar una venta existente
function updateSale(req, res) {
  const { id } = req.params;
  const { fecha_venta, clienteId, usuarioId, total, subtotal } = req.body; // Cambiado a fecha_venta

  salesModel
    .updateSale(id, fecha_venta, clienteId, usuarioId, total, subtotal) // Cambiado a fecha_venta
    .then((sale) => {
      res.status(200).json({
        message: "Venta actualizada exitosamente",
        sale,
      });
    })
    .catch((error) => {
      console.error("Error al actualizar la venta:", error.message);
      res.status(500).json({ error: "Error al actualizar la venta" });
    });
}

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  deleteSale,
  updateSale,
};