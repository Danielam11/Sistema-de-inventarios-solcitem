const pool = require("../config/db");

function getAllModels() {
  const query = "SELECT * FROM Modelos";
  return pool.query(query).then((result) => result.rows);
}

function createModel(nombre) {
  const query = "INSERT INTO Modelos (nombre) VALUES ($1) RETURNING *";
  const values = [nombre];
  return pool.query(query, values).then((result) => result.rows[0]);
}

function getModelById(id) {
  const query = "SELECT * FROM Modelos WHERE modelo_id = $1";
  return pool.query(query, [id]).then((result) => result.rows[0]);
}

function deleteModel(id) {
  const query = "DELETE FROM Modelos WHERE modelo_id = $1";
  return pool.query(query, [id]);
}

module.exports = {
  getAllModels,
  createModel,
  getModelById,
  deleteModel,
};
