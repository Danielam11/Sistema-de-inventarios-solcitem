const pool = require("../config/db");

function getAllBrands() {
  const query = "SELECT * FROM Marcas";
  return pool.query(query).then((result) => result.rows);
}

// Crear una nueva marca
function createBrand(nombre) {
  const query = "INSERT INTO Marcas (nombre) VALUES ($1) RETURNING *";
  const values = [nombre];
  return pool.query(query, values).then((result) => result.rows[0]);
}

// Obtener una marca por ID
function getBrandById(id) {
  const query = "SELECT * FROM Marcas WHERE marca_id = $1";
  return pool.query(query, [id]).then((result) => result.rows[0]);
}

/* Actualizar una marca
function updateBrand(id, nombre) {
  const query = 'UPDATE Marcas SET nombre = $1 WHERE marca_id = $2 RETURNING *';
  const values = [nombre, id];
  return pool.query(query, values).then((result) => result.rows[0]);
}*/

function deleteBrand(id) {
  const query = "DELETE FROM Marcas WHERE marca_id = $1";
  return pool.query(query, [id]);
}

module.exports = {
  getAllBrands,
  createBrand,
  getBrandById,
  deleteBrand,
};
