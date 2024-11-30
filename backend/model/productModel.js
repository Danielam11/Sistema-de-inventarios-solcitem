const pool = require("../config/db");

// Obtener todos los productos
function getAllProducts() {
  const query = `
    SELECT p.producto_id, p.nombre, p.descripcion, p.precio_compra, p.precio_venta, p.cantidad,
           m.nombre AS marca_nombre, c.nombre AS categoria_nombre, mo.nombre AS modelo_nombre
    FROM Productos p
    LEFT JOIN Marcas m ON p.marca_id = m.marca_id
    LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
    LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id`;
  return pool.query(query).then((result) => result.rows);
}

// Crear un nuevo producto
function createProduct(
  nombre,
  descripcion,
  precioCompra,
  precioVenta,
  cantidad,
  marcaId,
  categoriaId,
  modeloId
) {
  const query = `
    INSERT INTO Productos (nombre, descripcion, precio_compra, precio_venta, cantidad, marca_id, categoria_id, modelo_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
  const values = [
    nombre,
    descripcion,
    precioCompra,
    precioVenta,
    cantidad,
    marcaId,
    categoriaId,
    modeloId,
  ];
  return pool.query(query, values).then((result) => result.rows[0]);
}

// Obtener un producto por ID
function getProductById(id) {
  const query = `
    SELECT p.producto_id, p.nombre, p.descripcion, p.precio_compra, p.precio_venta, p.cantidad,
           m.nombre AS marca_nombre, c.nombre AS categoria_nombre, mo.nombre AS modelo_nombre
    FROM Productos p
    LEFT JOIN Marcas m ON p.marca_id = m.marca_id
    LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
    LEFT JOIN Modelos mo ON p.modelo_id = mo.modelo_id
    WHERE p.producto_id = $1`;
  return pool.query(query, [id]).then((result) => result.rows[0]);
}

// Actualizar un producto
function updateProduct(
  id,
  nombre,
  descripcion,
  precioCompra,
  precioVenta,
  cantidad,
  marcaId,
  categoriaId,
  modeloId
) {
  const query = `
    UPDATE Productos
    SET nombre = $1, descripcion = $2, precio_compra = $3, precio_venta = $4, cantidad = $5,
        marca_id = $6, categoria_id = $7, modelo_id = $8
    WHERE producto_id = $9 RETURNING *`;
  const values = [
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
  return pool.query(query, values).then((result) => result.rows[0]);
}

// Eliminar un producto
function deleteProduct(id) {
  const query = "DELETE FROM Productos WHERE producto_id = $1";
  return pool.query(query, [id]);
}

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
