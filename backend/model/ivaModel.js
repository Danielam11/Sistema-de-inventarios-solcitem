// models/IVA.js
const pool = require("../config/db");

function getAllIVA() {
  const query = "SELECT * FROM IVA";
  return pool.query(query).then((result) => result.rows);
}

function createIVA(porcentaje, estado) {
  const query = "INSERT INTO IVA (porcentaje, estado) VALUES ($1, $2) RETURNING *";
  const values = [porcentaje, estado];
  return pool.query(query, values).then((result) => result.rows[0]);
}

function getIVAById(id) {
  const query = "SELECT * FROM IVA WHERE iva_id = $1";
  return pool.query(query, [id]).then((result) => result.rows[0]);
}

function deleteIVA(id) {
  const query = "DELETE FROM IVA WHERE iva_id = $1";
  return pool.query(query, [id]);
}

module.exports = {
  getAllIVA,
  createIVA,
  getIVAById,
  deleteIVA,
};