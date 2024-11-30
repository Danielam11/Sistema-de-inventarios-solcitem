const salesModel = require("../model/saleModel");

// Crear una nueva venta
function createSale(req, res) {
  const { fechaVenta, clienteId, usuarioId, total, subtotal, detalles } =
    req.body;

  salesModel
    .createSale(fechaVenta, clienteId, usuarioId, total, subtotal, detalles)
    .then(function (sale) {
      res.status(201).json({
        message: "Venta creada exitosamente",
        sale: sale,
      });
    })
    .catch(function (error) {
      console.error("Error al crear la venta:", error);
      res.status(500).json({ error: "Error al crear la venta" });
    });
}

// Obtener todas las ventas
function getAllSales(req, res) {
  salesModel
    .getAllSales()
    .then(function (sales) {
      res.status(200).json(sales);
    })
    .catch(function (error) {
      console.error("Error al obtener las ventas:", error);
      res.status(500).json({ error: "Error al obtener las ventas" });
    });
}

// Obtener una venta por ID
function getSaleById(req, res) {
  const { id } = req.params;

  salesModel
    .getSaleById(id)
    .then(function (sale) {
      res.status(200).json(sale);
    })
    .catch(function (error) {
      console.error("Error al obtener la venta:", error);
      res.status(500).json({ error: "Venta no encontrada" });
    });
}

// Eliminar una venta
function deleteSale(req, res) {
  const { id } = req.params;

  salesModel
    .deleteSale(id)
    .then(function () {
      res.status(200).json({ message: "Venta eliminada exitosamente" });
    })
    .catch(function (error) {
      console.error("Error al eliminar la venta:", error);
      res.status(500).json({ error: "Error al eliminar la venta" });
    });
}

// Actualizar una venta existente
async function updateSale(req, res) {
  const { id } = req.params;
  const { fechaVenta, clienteId, usuarioId, total, subtotal, detalles } =
    req.body;

  try {
    // Actualizamos la venta
    const sale = await salesModel.updateSale(
      id,
      fechaVenta,
      clienteId,
      usuarioId,
      total,
      subtotal
    );

    // Actualizamos los detalles de la venta
    await salesModel.updateSaleDetails(id, detalles);

    res.status(200).json({
      message: "Venta actualizada exitosamente",
      sale: sale,
    });
  } catch (error) {
    console.error("Error al actualizar la venta:", error);
    res.status(500).json({ error: "Error al actualizar la venta" });
  }
}

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  deleteSale,
  updateSale,
};
