const pool = require("../config/db");

async function getAllSuppliers() {
  const { rows } = await pool.query("SELECT * FROM Proveedores");
  return rows;
}

async function getSupplierById(supplierId) {
  const { rows } = await pool.query(
    "SELECT proveedor_id FROM Proveedores WHERE  proveedor_id = $1",
    [supplierId]
  );
  return rows[0];
}

async function createSupplier(identification, name, address, phone, email) {
  const { rows } = await pool.query(
    "INSERT INTO Proveedores (identificacion, nombre, direccion, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [identification, name, address, phone, email]
  );
  return rows[0];
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
  return rows[0];
}

async function deleteSupplier(supplierId) {
  try {
    await pool.query("DELETE FROM Proveedores WHERE proveedor_id = $1", [
      supplierId,
    ]);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
