const orderModel = require("../model/orderModel");

// Crear un nuevo pedido (order)
async function createOrder(req, res) {
  try {
    const { fechaPedido, proveedorId, usuarioId, total, subtotal, detalles } =
      req.body;
    const order = await orderModel.createOrder(
      fechaPedido,
      proveedorId,
      usuarioId,
      total,
      subtotal,
      detalles
    );
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener todos los pedidos (orders)
async function getAllOrders(req, res) {
  try {
    const orders = await orderModel.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener un pedido (order) por ID
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar un pedido (order)
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    await orderModel.deleteOrder(id);
    res.status(200).json({ message: "Pedido (order) eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar un pedido (order)
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { fechaPedido, proveedorId, usuarioId, total, subtotal } = req.body;
    const updatedOrder = await orderModel.updateOrder(
      id,
      fechaPedido,
      proveedorId,
      usuarioId,
      total,
      subtotal
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar los detalles de un pedido (order details)
async function updateOrderDetails(req, res) {
  try {
    const { id } = req.params;
    const { detalles } = req.body;
    await orderModel.updateOrderDetails(id, detalles);
    res.status(200).json({
      message: "Detalles del pedido (order details) actualizados correctamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
  updateOrderDetails,
};
