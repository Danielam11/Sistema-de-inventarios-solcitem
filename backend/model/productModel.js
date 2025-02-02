const pool = require("../config/db");

// Obtener todos los productos con sus proveedores
function getAllProducts() {
  const query = `
    SELECT p.producto_id, p.nombre, p.descripcion, p.precio_compra, p.precio_venta, p.cantidad,
           m.nombre AS marca_nombre, c.nombre AS categoria_nombre, mo.nombre AS modelo_nombre,
           ARRAY_AGG(pr.nombre) AS proveedores
    FROM Productos p
    LEFT JOIN Marcas m ON p.marca_id = m.marca_id
    LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
    LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id
    LEFT JOIN Producto_Proveedor pp ON p.producto_id = pp.producto_id
    LEFT JOIN Proveedores pr ON pp.proveedor_id = pr.proveedor_id
    GROUP BY p.producto_id, m.nombre, c.nombre, mo.nombre`;
  return pool.query(query).then((result) => result.rows);
}

async function getProductsBySupplier(proveedorId) {
  try {
    const query = `
      SELECT 
        p.producto_id, 
        p.nombre, 
        p.descripcion, 
        p.precio_compra, 
        p.precio_venta, 
        p.cantidad, 
        p.marca_id, 
        m.nombre AS marca_nombre, 
        p.categoria_id, 
        c.nombre AS categoria_nombre, 
        p.modelo_id, 
        mo.nombre AS modelo_nombre
      FROM Productos p
      INNER JOIN producto_proveedor pp ON p.producto_id = pp.producto_id
      LEFT JOIN Marcas m ON p.marca_id = m.marca_id
      LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id
      WHERE pp.proveedor_id = $1`;

    const result = await pool.query(query, [proveedorId]);
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener productos del proveedor: " + error.message);
  }
}

// Crear un nuevo producto y asociarlo con proveedores
async function createProduct(
  nombre,
  descripcion,
  precioCompra,
  precioVenta,
  cantidad,
  marcaId,
  categoriaId,
  modeloId,
  proveedorIds
) {
  console.log("Backend: Recibiendo datos para insertar:", {
    nombre,
    descripcion,
    precioCompra,
    precioVenta,
    cantidad,
    marcaId,
    categoriaId,
    modeloId,
    proveedorIds
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insertar el producto
    const queryProduct = `
      INSERT INTO Productos (nombre, descripcion, precio_compra, precio_venta, cantidad, marca_id, categoria_id, modelo_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING producto_id`;
    const valuesProduct = [
      nombre,
      descripcion,
      precioCompra,
      precioVenta,
      cantidad,
      marcaId,
      categoriaId,
      modeloId,
    ];

    const result = await client.query(queryProduct, valuesProduct);
    const productoId = result.rows[0].producto_id;
    console.log("Producto insertado con ID:", productoId);

    // Insertar la relación con proveedores
    if (proveedorIds && proveedorIds.length > 0) {
      const placeholders = proveedorIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      const queryProveedor = `INSERT INTO Producto_Proveedor (producto_id, proveedor_id) VALUES ${placeholders}`;
      console.log("Ejecutando query de proveedores:", queryProveedor, "con valores:", [productoId, ...proveedorIds]);
      
      await client.query(queryProveedor, [productoId, ...proveedorIds]);
    }

    await client.query("COMMIT");
    return { productoId, nombre, descripcion, precioCompra, precioVenta, cantidad };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en createProduct:", error);
    throw error;
  } finally {
    client.release();
  }
}


// Obtener un producto por ID con proveedores
function getProductById(id) {
  const query = `
    SELECT p.producto_id, p.nombre, p.descripcion, p.precio_compra, p.precio_venta, p.cantidad,
           m.nombre AS marca_nombre, c.nombre AS categoria_nombre, mo.nombre AS modelo_nombre,
           ARRAY_AGG(pr.nombre) AS proveedores
    FROM Productos p
    LEFT JOIN Marcas m ON p.marca_id = m.marca_id
    LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
    LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id
    LEFT JOIN Producto_Proveedor pp ON p.producto_id = pp.producto_id
    LEFT JOIN Proveedores pr ON pp.proveedor_id = pr.proveedor_id
    WHERE p.producto_id = $1
    GROUP BY p.producto_id, m.nombre, c.nombre, mo.nombre`;
  return pool.query(query, [id]).then((result) => result.rows[0]);
}

// Actualizar un producto y su relación con proveedores
async function updateProduct(
  id,
  nombre,
  descripcion,
  precioCompra,
  precioVenta,
  cantidad,
  marcaId,
  categoriaId,
  modeloId,
  proveedorIds // Lista de proveedores
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Actualizar el producto
    const queryProduct = `
      UPDATE Productos
      SET nombre = $1, descripcion = $2, precio_compra = $3, precio_venta = $4, cantidad = $5,
          marca_id = $6, categoria_id = $7, modelo_id = $8
      WHERE producto_id = $9 RETURNING *`;
    const valuesProduct = [
      nombre,
      descripcion,
      precioCompra,
      precioVenta,
      cantidad,
      marcaId,
      categoriaId,
      modeloId,
      id,
    ];
    await client.query(queryProduct, valuesProduct);

    // Eliminar relaciones anteriores con proveedores
    await client.query("DELETE FROM Producto_Proveedor WHERE producto_id = $1", [id]);

    // Insertar nuevas relaciones con proveedores
    if (proveedorIds && proveedorIds.length > 0) {
      const queryProveedor = `
        INSERT INTO Producto_Proveedor (producto_id, proveedor_id)
        VALUES ${proveedorIds.map((_, i) => `(${id}, $${i + 1})`).join(", ")}`;
      await client.query(queryProveedor, proveedorIds);
    }

    await client.query("COMMIT");
    return { id, nombre, descripcion, precioCompra, precioVenta, cantidad };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Eliminar un producto y sus relaciones con proveedores
async function deleteProduct(id) {
  const query = "DELETE FROM Productos WHERE producto_id = $1";
  return pool.query(query, [id]);
}

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySupplier
};
