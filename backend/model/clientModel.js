const pool = require("../config/db");

// Obtener todos los clientes
async function getAllClients() {
  const { rows } = await pool.query("SELECT * FROM Clientes");
  return rows;
}

// Get a client by ID
async function getClientById(clientId) {
  const { rows } = await pool.query(
    "SELECT * FROM Clientes WHERE cliente_id = $1",
    [clientId]
  );
  return rows[0];
}

// Create a new client
async function createClient(identification, name, address, phone, email) {
  const { rows } = await pool.query(
    "INSERT INTO Clientes (identificacion, nombre, direccion, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [identification, name, address, phone, email]
  );
  return rows[0];
}

// Update an existing client
async function updateClient(
  clientId,
  identification,
  name,
  address,
  phone,
  email
) {
  const { rows } = await pool.query(
    "UPDATE Clientes SET identificacion = $1, nombre = $2, direccion = $3, telefono = $4, email = $5 WHERE cliente_id = $6 RETURNING *",
    [identification, name, address, phone, email, clientId]
  );
  return rows[0];
}

// Delete a client
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
  createClient,
  updateClient,
  deleteClient,
};
