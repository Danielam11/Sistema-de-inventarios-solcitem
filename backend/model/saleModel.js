const pool = require("../config/db");

// Crear una nueva venta
async function createSale(
  fechaVenta,
  clienteId,
  usuarioId,
  total,
  subtotal,
  detalles
) {
  try {
    // Insertar la venta
    const query = `
      INSERT INTO Ventas (fecha_venta, cliente_id, usuario_id, total, subtotal)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [fechaVenta, clienteId, usuarioId, total, subtotal];
    const result = await pool.query(query, values);
    const venta = result.rows[0];

    // Insertar los detalles de la venta
    for (let detalle of detalles) {
      const detalleQuery = `
        INSERT INTO Detalle_venta (venta_id, producto_id, cantidad_productos, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)`;
      const detalleValues = [
        venta.venta_id,
        detalle.productoId,
        detalle.cantidadProductos,
        detalle.precioUnitario,
        detalle.subtotal,
      ];
      await pool.query(detalleQuery, detalleValues);
    }

    return venta;
  } catch (error) {
    throw new Error("Error al crear la venta: " + error.message);
  }
}

// Obtener todas las ventas
async function getAllSales() {
  try {
    const query = `
      SELECT v.venta_id, v.fecha_venta, v.total, v.subtotal, 
             c.nombre AS cliente_nombre, 
             u.nombre AS usuario_nombre
      FROM Ventas v
      LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN Usuarios u ON v.usuario_id = u.usuario_id`;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener las ventas: " + error.message);
  }
}

// Obtener una venta por ID
async function getSaleById(id) {
  try {
    const ventaQuery = `
      SELECT v.venta_id, v.fecha_venta, v.total, v.subtotal, 
             c.nombre AS cliente_nombre, 
             u.nombre AS usuario_nombre
      FROM Ventas v
      LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN Usuarios u ON v.usuario_id = u.usuario_id
      WHERE v.venta_id = $1`;
    const ventaResult = await pool.query(ventaQuery, [id]);
    const venta = ventaResult.rows[0];

    if (!venta) {
      throw new Error("Venta no encontrada");
    }

    const detalleQuery = `
      SELECT dv.detalle_id, dv.producto_id, p.nombre AS producto_nombre, 
             dv.cantidad_productos, dv.precio_unitario, dv.subtotal
      FROM Detalle_venta dv
      LEFT JOIN Productos p ON dv.producto_id = p.producto_id
      WHERE dv.venta_id = $1`;
    const detalleResult = await pool.query(detalleQuery, [id]);

    return { venta, detalles: detalleResult.rows };
  } catch (error) {
    throw new Error("Error al obtener la venta: " + error.message);
  }
}

// Eliminar una venta
async function deleteSale(id) {
  try {
    // Eliminar los detalles de la venta
    const detalleQuery = `DELETE FROM Detalle_venta WHERE venta_id = $1`;
    await pool.query(detalleQuery, [id]);

    // Eliminar la venta
    const ventaQuery = `DELETE FROM Ventas WHERE venta_id = $1`;
    await pool.query(ventaQuery, [id]);
  } catch (error) {
    throw new Error("Error al eliminar la venta: " + error.message);
  }
}

// Actualizar una venta
async function updateSale(
  id,
  fechaVenta,
  clienteId,
  usuarioId,
  total,
  subtotal,
  detalles
) {
  const client = await pool.connect(); // Obtener el cliente para la transacción
  try {
    await client.query("BEGIN"); // Iniciar la transacción

    // Actualizar la cabecera de la venta
    const query = `
      UPDATE Ventas
      SET fecha_venta = $1, cliente_id = $2, usuario_id = $3, total = $4, subtotal = $5
      WHERE venta_id = $6
      RETURNING *`;
    const values = [fechaVenta, clienteId, usuarioId, total, subtotal, id];
    const result = await client.query(query, values);
    const venta = result.rows[0];

    if (!venta) {
      throw new Error("Venta no encontrada");
    }

    // Eliminar los detalles antiguos
    const deleteQuery = `DELETE FROM Detalle_venta WHERE venta_id = $1`;
    await client.query(deleteQuery, [id]);

    // Insertar nuevos detalles
    for (let detalle of detalles) {
      const detalleQuery = `
        INSERT INTO Detalle_venta (venta_id, producto_id, cantidad_productos, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)`;
      const detalleValues = [
        id,
        detalle.productoId,
        detalle.cantidadProductos,
        detalle.precioUnitario,
        detalle.subtotal,
      ];
      await client.query(detalleQuery, detalleValues);
    }

    await client.query("COMMIT"); // Confirmar la transacción
    return venta; // Retornar la venta actualizada
  } catch (error) {
    await client.query("ROLLBACK"); // Deshacer la transacción en caso de error
    throw new Error("Error al actualizar la venta: " + error.message);
  } finally {
    client.release(); // Liberar el cliente
  }
}

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  deleteSale,
  updateSale,
};
