const pool = require("../config/db");

// Obtener todos los clientes
async function getAllClients() {
  const { rows } = await pool.query("SELECT * FROM Clientes");
  return rows;
}

// Obtener un cliente por ID
async function getClientById(clientId) {
  const { rows } = await pool.query(
    "SELECT * FROM Clientes WHERE cliente_id = $1",
    [clientId]
  );
  return rows[0];
}

async function getClientByIdentificacion(identificacion) {
  const query = "SELECT * FROM Clientes WHERE identificacion = $1";
  const result = await pool.query(query, [identificacion]);
  return result.rows[0];
}

// Crear un nuevo cliente
async function createClient(identification, name, address, phone, email) {
  const { rows } = await pool.query(
    "INSERT INTO Clientes (identificacion, nombre, direccion, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [identification, name, address, phone, email]
  );
  return rows[0];
}

// Actualizar un cliente existente
async function updateClient(clientId, identification, name, address, phone, email) {
  const { rows } = await pool.query(
    "UPDATE Clientes SET identificacion = $1, nombre = $2, direccion = $3, telefono = $4, email = $5 WHERE cliente_id = $6 RETURNING *",
    [identification, name, address, phone, email, clientId]
  );
  return rows[0];
}

// Eliminar un cliente
async function deleteClient(clientId) {
  const { rowCount } = await pool.query(
    "DELETE FROM Clientes WHERE cliente_id = $1",
    [clientId]
  );
  return rowCount > 0;
}

module.exports = {
  getAllClients,
  getClientById,
  getClientByIdentificacion,
  createClient,
  updateClient,
  deleteClient,
};