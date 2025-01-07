const pool = require("../config/db");

async function getAllSuppliers() {
  const { rows } = await pool.query("SELECT * FROM Proveedores");
  return rows;
}

async function getSupplierById(supplierId) {
  const { rows } = await pool.query(
    "SELECT * FROM Proveedores WHERE proveedor_id = $1",
    [supplierId]
  );
  return rows[0]; // Devuelve el proveedor si existe, o undefined
}

async function createSupplier(identification, name, address, phone, email) {
  const { rows } = await pool.query(
    "INSERT INTO Proveedores (identificacion, nombre, direccion, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [identification, name, address, phone, email]
  );
  return rows[0]; // Devuelve el proveedor creado
}

async function updateSupplier(
  proveedorId,
  identification,
  name,
  address,
  phone,
  email
) {
  const { rows } = await pool.query(
    "UPDATE Proveedores SET identificacion = $1, nombre = $2, direccion = $3, telefono = $4, email = $5 WHERE proveedor_id = $6 RETURNING *",
    [identification, name, address, phone, email, proveedorId]
  );
  return rows[0]; // Devuelve el proveedor actualizado
}

async function deleteSupplier(supplierId) {
  try {
    const result = await pool.query(
      "DELETE FROM Proveedores WHERE proveedor_id = $1",
      [supplierId]
    );
    return result.rowCount > 0; // Devuelve true si se eliminó al menos una fila
  } catch (error) {
    throw error; // Maneja el error en el controlador
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
