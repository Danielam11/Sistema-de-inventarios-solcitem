const pool = require("../config/db");

// Crear un nuevo pedido (order)
async function createOrder(fechaPedido, proveedorId, usuarioId, total, detalles) {
  try {
    // Insertar el pedido (order)
    const query = `
        INSERT INTO Pedidos (fecha_pedido, proveedor_id, usuario_id, total)
        VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [fechaPedido, proveedorId, usuarioId, total];
    const result = await pool.query(query, values);
    const order = result.rows[0];

    // Insertar los detalles del pedido (order details) usando map y Promise.all
    const detalleQueries = detalles.map((detalle) => {
      const detalleQuery = `
          INSERT INTO Detalle_pedido (pedido_id, producto_id, proveedor_id, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)`;
      const detalleValues = [
        order.pedido_id,
        detalle.productoId,
        detalle.proveedorId,
        detalle.cantidad,
        detalle.precioUnitario,
        detalle.subtotal,
      ];
      return pool.query(detalleQuery, detalleValues);
    });

    // Ejecutar todas las consultas en paralelo
    await Promise.all(detalleQueries);

    return order;
  } catch (error) {
    throw new Error("Error al crear el pedido (order): " + error.message);
  }
}

// Obtener todos los pedidos (orders)
async function getAllOrders() {
  try {
    const query = `
      SELECT p.pedido_id, p.fecha_pedido, p.total, 
             pr.nombre AS proveedor_nombre, 
             u.email AS usuario_email -- Ajustado para usar la columna 'email'
      FROM Pedidos p
      LEFT JOIN Proveedores pr ON p.proveedor_id = pr.proveedor_id
      LEFT JOIN Usuarios u ON p.usuario_id = u.usuario_id`;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener los pedidos (orders): " + error.message);
  }
}

// Obtener un pedido (order) por ID
async function getOrderById(id) {
  try {
    const orderQuery = `
      SELECT p.pedido_id, p.fecha_pedido, p.total, 
             pr.nombre AS proveedor_nombre, 
             u.email AS usuario_email -- Ajustado para usar la columna 'email'
      FROM Pedidos p
      LEFT JOIN Proveedores pr ON p.proveedor_id = pr.proveedor_id
      LEFT JOIN Usuarios u ON p.usuario_id = u.usuario_id
      WHERE p.pedido_id = $1`;
    const orderResult = await pool.query(orderQuery, [id]);
    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Pedido (order) no encontrado");
    }

    const detalleQuery = `
      SELECT dp.detalle_id, dp.producto_id, p.nombre AS producto_nombre, 
             dp.cantidad, dp.precio_unitario, dp.subtotal
      FROM Detalle_pedido dp
      LEFT JOIN Productos p ON dp.producto_id = p.producto_id
      WHERE dp.pedido_id = $1`;
    const detalleResult = await pool.query(detalleQuery, [id]);

    return { order, detalles: detalleResult.rows };
  } catch (error) {
    throw new Error("Error al obtener el pedido (order): " + error.message);
  }
}

// Eliminar un pedido (order)
async function deleteOrder(id) {
  try {
    // Eliminar los detalles del pedido (order details)
    const detalleQuery = `DELETE FROM Detalle_pedido WHERE pedido_id = $1`;
    await pool.query(detalleQuery, [id]);

    // Eliminar el pedido (order)
    const orderQuery = `DELETE FROM Pedidos WHERE pedido_id = $1`;
    await pool.query(orderQuery, [id]);
  } catch (error) {
    throw new Error("Error al eliminar el pedido (order): " + error.message);
  }
}

// Actualizar un pedido (order)
async function updateOrder(id, fechaPedido, proveedorId, usuarioId, total, detalles) {
  try {
    // 1. Actualizar la cabecera del pedido
    const query = `
        UPDATE Pedidos
        SET fecha_pedido = $1, proveedor_id = $2, usuario_id = $3, total = $4
        WHERE pedido_id = $5
        RETURNING *`;
    const values = [fechaPedido, proveedorId, usuarioId, total, id];
    const result = await pool.query(query, values);
    const updatedOrder = result.rows[0];

    // 2. Eliminar los detalles antiguos del pedido
    const deleteQuery = `DELETE FROM Detalle_pedido WHERE pedido_id = $1`;
    await pool.query(deleteQuery, [id]);

    // 3. Insertar los nuevos detalles
    const detalleQueries = detalles.map((detalle) => {
      const detalleQuery = `
          INSERT INTO Detalle_pedido (pedido_id, producto_id, proveedor_id, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)`;
      const detalleValues = [
        updatedOrder.pedido_id,
        detalle.productoId,
        detalle.proveedorId,
        detalle.cantidad,
        detalle.precioUnitario,
        detalle.subtotal,
      ];
      return pool.query(detalleQuery, detalleValues);
    });

    // Ejecutar todas las consultas de detalle en paralelo
    await Promise.all(detalleQueries);

    // Retornar el pedido actualizado
    return updatedOrder;
  } catch (error) {
    throw new Error(
      "Error al actualizar el pedido completo (cabecera + detalles): " +
        error.message
    );
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
};
