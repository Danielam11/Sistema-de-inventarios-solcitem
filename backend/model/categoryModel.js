// models/categoryModel.js

const db = require("../config/db"); // Asegúrate de tener configurada tu conexión a la base de datos

// Function to create a category
async function createCategory(name) {
  const result = await db.query(
    "INSERT INTO Categorias (nombre) VALUES ($1) RETURNING *",
    [name]
  );
  return result.rows[0];
}

// Function to get all categories
async function getAllCategories() {
  const result = await db.query("SELECT * FROM Categorias");
  return result.rows;
}

// Function to get a category by ID
async function getCategoryById(id) {
  const result = await db.query(
    "SELECT * FROM Categorias WHERE categoria_id = $1",
    [id]
  );
  return result.rows[0];
}

// Function to update a category
async function updateCategory(id, name) {
  const result = await db.query(
    "UPDATE Categorias SET name = $1 WHERE categoria_id = $2 RETURNING *",
    [name, id]
  );
  return result.rows[0];
}

// Function to delete a category
async function deleteCategory(id) {
  await db.query("DELETE FROM Categorias WHERE categoria_id = $1", [id]);
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
