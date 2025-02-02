const pool = require("../config/db");

// Crear un detalle de venta y actualizar el subtotal de la venta
async function createDetalleVenta(ventaId, productoId, cantidadProductos) {
  try {
    // Verificar que la venta exista
    const ventaQuery = `
      SELECT venta_id FROM Ventas WHERE venta_id = $1`;
    const ventaResult = await pool.query(ventaQuery, [ventaId]);

    if (ventaResult.rows.length === 0) {
      throw new Error("Venta no encontrada");
    }

    // Obtener el precio_venta del producto
    const productoQuery = `
      SELECT precio_venta FROM Productos WHERE producto_id = $1`;
    const productoResult = await pool.query(productoQuery, [productoId]);

    if (productoResult.rows.length === 0) {
      throw new Error("Producto no encontrado");
    }

    const precioUnitario = productoResult.rows[0].precio_venta;

    // Validar que el precio_venta no sea null
    if (precioUnitario === null) {
      throw new Error("El producto no tiene un precio de venta definido");
    }

    // Calcular el subtotal del detalle de venta
    const subtotal = cantidadProductos * precioUnitario;

    // Insertar el detalle de venta
    const insertQuery = `
      INSERT INTO Detalle_venta (venta_id, producto_id, cantidad_productos, precio_unitario, subtotal)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const insertValues = [ventaId, productoId, cantidadProductos, precioUnitario, subtotal];
    const detalleResult = await pool.query(insertQuery, insertValues);

    // Calcular el nuevo subtotal de la venta
    const subtotalVentaQuery = `
      SELECT SUM(subtotal) AS subtotal FROM Detalle_venta WHERE venta_id = $1`;
    const subtotalVentaResult = await pool.query(subtotalVentaQuery, [ventaId]);

    const nuevoSubtotal = subtotalVentaResult.rows[0].subtotal || 0; // Si no hay detalles, el subtotal es 0

    // Actualizar el subtotal en la tabla Ventas
    const updateVentaQuery = `
      UPDATE Ventas
      SET subtotal = $1
      WHERE venta_id = $2
      RETURNING *`;
    const updateValues = [nuevoSubtotal, ventaId];
    await pool.query(updateVentaQuery, updateValues);

    return detalleResult.rows[0]; // Retorna el detalle de venta recién creado
  } catch (error) {
    throw new Error("Error al crear el detalle de venta: " + error.message);
  }
}

// Obtener todos los detalles de venta
async function getAllDetallesVenta() {
  try {
    const query = `
      SELECT 
        dv.*, 
        p.nombre AS producto_nombre, 
        p.precio_venta AS producto_precio,
        m.nombre AS marca_nombre,  -- Nombre de la marca
        mo.nombre AS modelo_nombre  -- Nombre del modelo
      FROM Detalle_venta dv
      LEFT JOIN Productos p ON dv.producto_id = p.producto_id
      LEFT JOIN Marcas m ON p.marca_id = m.marca_id  -- Unir con Marcas
      LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id;  -- Unir con Modelos`;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener los detalles de venta: " + error.message);
  }
}

// Obtener los detalles de una venta por ID de la venta
async function getDetallesByVentaId(ventaId) {
  try {
    const query = `
      SELECT 
        dv.*, 
        p.nombre AS producto_nombre, 
        p.precio_venta AS producto_precio,
        m.nombre AS marca_nombre,  -- Nombre de la marca
        mo.nombre AS modelo_nombre  -- Nombre del modelo
      FROM Detalle_venta dv
      LEFT JOIN Productos p ON dv.producto_id = p.producto_id
      LEFT JOIN Marcas m ON p.marca_id = m.marca_id  -- Unir con Marcas
      LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id  -- Unir con Modelos
      WHERE dv.venta_id = $1`;
    const result = await pool.query(query, [ventaId]);
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener los detalles de la venta: " + error.message);
  }
}

// Eliminar un detalle de venta por su ID
async function deleteDetalleVenta(detalleId) {
  try {
    const query = `DELETE FROM Detalle_venta WHERE detalle_id = $1`;
    await pool.query(query, [detalleId]);
  } catch (error) {
    throw new Error("Error al eliminar el detalle de venta: " + error.message);
  }
}

async function updateDetalleVenta(detalleId, productoId, cantidadProductos) {
  try {
    console.log("Iniciando actualización del detalle de venta...");
    console.log("detalleId:", detalleId);
    console.log("productoId:", productoId);
    console.log("cantidadProductos:", cantidadProductos);

    // Obtener el detalle de venta actual
    const detalleQuery = `
      SELECT 
        dv.venta_id, 
        dv.producto_id, 
        dv.cantidad_productos, 
        dv.precio_unitario, 
        dv.subtotal,
        v.subtotal AS venta_subtotal,
        v.total AS venta_total
      FROM Detalle_venta dv
      LEFT JOIN Ventas v ON dv.venta_id = v.venta_id
      WHERE dv.detalle_id = $1`;
    const detalleResult = await pool.query(detalleQuery, [detalleId]);

   

    if (detalleResult.rows.length === 0) {
      throw new Error("Detalle de venta no encontrado");
    }

    const detalle = detalleResult.rows[0];
 

    // Obtener el nuevo precio_unitario del producto
    const productoQuery = `
      SELECT precio_venta FROM Productos WHERE producto_id = $1`;
    const productoResult = await pool.query(productoQuery, [productoId]);

    if (productoResult.rows.length === 0) {
      throw new Error("Producto no encontrado");
    }

    const nuevoPrecioUnitario = productoResult.rows[0].precio_venta;

    // Verificar que el nuevo precio_unitario no sea null
    if (nuevoPrecioUnitario === null) {
      throw new Error("El producto no tiene un precio de venta definido");
    }

    // Calcular el nuevo subtotal del detalle de venta
    const nuevoSubtotalDetalle = cantidadProductos * nuevoPrecioUnitario;


    // Actualizar el detalle de venta (incluyendo producto_id)
    const updateDetalleQuery = `
      UPDATE Detalle_venta
      SET producto_id = $1, cantidad_productos = $2, precio_unitario = $3, subtotal = $4
      WHERE detalle_id = $5
      RETURNING *`;
    const updateDetalleValues = [productoId, cantidadProductos, nuevoPrecioUnitario, nuevoSubtotalDetalle, detalleId];
    const updateDetalleResult = await pool.query(updateDetalleQuery, updateDetalleValues);

    

    // Recalcular el subtotal de la venta
    const subtotalVentaQuery = `
      SELECT SUM(subtotal) AS subtotal FROM Detalle_venta WHERE venta_id = $1`;
    const subtotalVentaResult = await pool.query(subtotalVentaQuery, [detalle.venta_id]);

    

    const nuevoSubtotalVenta = subtotalVentaResult.rows[0].subtotal || 0; // Si no hay detalles, el subtotal es 0
   

    // Actualizar el subtotal y el total en la tabla Ventas
    const updateVentaQuery = `
      UPDATE Ventas
      SET subtotal = $1, total = $2
      WHERE venta_id = $3
      RETURNING *`;
    const updateVentaValues = [nuevoSubtotalVenta, nuevoSubtotalVenta, detalle.venta_id]; // Aquí puedes ajustar el cálculo del total si es necesario
    const updateVentaResult = await pool.query(updateVentaQuery, updateVentaValues);



    return { message: "Detalle de venta actualizado exitosamente" };
  } catch (error) {
    console.error("Error en updateDetalleVenta:", error.message);
    throw new Error("Error al actualizar el detalle de venta: " + error.message);
  }
}

module.exports = {
  createDetalleVenta,
  getAllDetallesVenta,
  getDetallesByVentaId,
  deleteDetalleVenta,
  updateDetalleVenta
};