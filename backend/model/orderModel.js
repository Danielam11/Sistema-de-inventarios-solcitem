const pool = require("../config/db");

// Crear un nuevo pedido (order)
// Crear un nuevo pedido sin enviar fecha_pedido ni subtotal
async function createOrder(proveedorId, usuarioId, total, detalles) {
  try {
    // Insertar el pedido
    const query = `
        INSERT INTO Pedidos (proveedor_id, usuario_id, total)
        VALUES ($1, $2, $3) RETURNING *`;
    const values = [proveedorId, usuarioId, total];
    const result = await pool.query(query, values);
    const order = result.rows[0];

    // Insertar los detalles del pedido SIN subtotal (lo calcula la BD)
    const detalleQueries = detalles.map((detalle) => {
      const detalleQuery = `
          INSERT INTO Detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
          VALUES ($1, $2, $3, $4)`;
      const detalleValues = [
        order.pedido_id,
        detalle.productoId,
        detalle.cantidad,
        detalle.precioUnitario,
      ];
      return pool.query(detalleQuery, detalleValues);
    });

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
             u.email AS usuario_email
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
// Obtener un pedido con sus detalles
async function getOrderById(id) {
  try {
    const orderQuery = `
      SELECT p.pedido_id, p.fecha_pedido, p.total, 
             pr.nombre AS proveedor_nombre, 
             u.email AS usuario_email
      FROM Pedidos p
      LEFT JOIN Proveedores pr ON p.proveedor_id = pr.proveedor_id
      LEFT JOIN Usuarios u ON p.usuario_id = u.usuario_id
      WHERE p.pedido_id = $1`;
    const orderResult = await pool.query(orderQuery, [id]);
    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Pedido (order) no encontrado");
    }

    // Consultar detalles sin enviar subtotal, la BD lo calcula
    const detalleQuery = `
      SELECT dp.detalle_id, dp.producto_id, p.nombre AS producto_nombre, 
             dp.cantidad, dp.precio_unitario, dp.cantidad * dp.precio_unitario AS subtotal
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
// Actualizar un pedido sin modificar fecha_pedido ni subtotal
async function updateOrder(id, proveedorId, usuarioId, total, detalles) {
  try {
    const query = `
        UPDATE Pedidos
        SET proveedor_id = $1, usuario_id = $2, total = $3
        WHERE pedido_id = $4
        RETURNING *`;
    const values = [proveedorId, usuarioId, total, id];
    const result = await pool.query(query, values);
    const updatedOrder = result.rows[0];

    // Eliminar detalles antiguos
    const deleteQuery = `DELETE FROM Detalle_pedido WHERE pedido_id = $1`;
    await pool.query(deleteQuery, [id]);

    // Insertar nuevos detalles sin subtotal
    const detalleQueries = detalles.map((detalle) => {
      const detalleQuery = `
          INSERT INTO Detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
          VALUES ($1, $2, $3, $4)`;
      const detalleValues = [
        updatedOrder.pedido_id,
        detalle.productoId,
        detalle.cantidad,
        detalle.precioUnitario,
      ];
      return pool.query(detalleQuery, detalleValues);
    });

    await Promise.all(detalleQueries);
    return updatedOrder;
  } catch (error) {
    throw new Error("Error al actualizar el pedido: " + error.message);
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
};