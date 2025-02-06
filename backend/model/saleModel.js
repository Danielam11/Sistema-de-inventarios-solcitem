const pool = require("../config/db");

// Crear una nueva venta con medio de pago
async function createSale(clienteId, usuarioId, total, subtotal, medioPago) {
  try {
    const query = `
      INSERT INTO Ventas (cliente_id, usuario_id, total, subtotal, medio_pago)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [clienteId, usuarioId, total, subtotal, medioPago];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error al crear la venta: " + error.message);
  }
}

// Obtener todas las ventas incluyendo el medio de pago
async function getAllSales() {
  try {
    const query = `
      SELECT 
        v.venta_id, 
        v.fecha_venta, 
        v.total, 
        v.subtotal, 
        v.medio_pago, 
        c.nombre AS cliente_nombre, 
        u.email AS usuario_nombre
      FROM Ventas v
      LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN Usuarios u ON v.usuario_id = u.usuario_id`;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener las ventas: " + error.message);
  }
}

// Obtener una venta por ID incluyendo el medio de pago
async function getSaleById(id) {
  try {
    const query = `
      SELECT 
        v.venta_id, 
        v.fecha_venta, 
        v.total, 
        v.subtotal, 
        v.medio_pago, 
        c.nombre AS cliente_nombre, 
        u.email AS usuario_nombre
      FROM Ventas v
      LEFT JOIN Clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN Usuarios u ON v.usuario_id = u.usuario_id
      WHERE v.venta_id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Venta no encontrada");
    }

    return result.rows[0];
  } catch (error) {
    throw new Error("Error al obtener la venta: " + error.message);
  }
}

// Eliminar una venta
async function deleteSale(id) {
  try {
    const query = `DELETE FROM Ventas WHERE venta_id = $1`;
    await pool.query(query, [id]);
  } catch (error) {
    throw new Error("Error al eliminar la venta: " + error.message);
  }
}

// Actualizar una venta incluyendo el medio de pago
async function updateSale(id, fechaVenta, clienteId, usuarioId, total, subtotal, medioPago) {
  try {
    const query = `
      UPDATE Ventas
      SET fecha_venta = $1, cliente_id = $2, usuario_id = $3, total = $4, subtotal = $5, medio_pago = $6
      WHERE venta_id = $7
      RETURNING *`;
    const values = [fechaVenta, clienteId, usuarioId, total, subtotal, medioPago, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Venta no encontrada");
    }

    return result.rows[0];
  } catch (error) {
    throw new Error("Error al actualizar la venta: " + error.message);
  }
}

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  deleteSale,
  updateSale,
};
