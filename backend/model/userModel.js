const pool = require("../config/db");
// req -> solicitud del cli al serv
// res -> respuesat del serv al cli

async function getAllUsers() {
  try {
    const res = await pool.query("SELECT * FROM Usuarios");
    return res.rows;
  } catch (error) {
    throw error;
  }
}

async function createUser(email, contrasena, rol) {
  try {
    const res = await pool.query(
      "INSERT INTO Usuarios (email, contrasena, rol) VALUES ($1, $2, $3) RETURNING usuario_id",
      [email, contrasena, rol]
    );
    return res.rows[0];
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const res = await pool.query("SELECT * FROM Usuarios WHERE email = $1", [
      email,
    ]);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
}

async function getUserById(usuario_id) {
  try {
    const res = await pool.query(
      "SELECT * FROM Usuarios WHERE usuario_id = $1",
      [usuario_id]
    );

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    throw error;
  }
}

async function updateUser(usuario_id, email, contrasena, rol) {
  try {
    const res = await pool.query(
      `UPDATE Usuarios 
       SET email = $1, contrasena = $2, rol = $3 
       WHERE usuario_id = $4 
       RETURNING *`,
      [email, contrasena, rol, usuario_id]
    );
    return res.rows[0]; 
  } catch (error) {
    throw error;
  }
}

async function deleteUser(usuario_id) {
  try {
    await pool.query("DELETE FROM Usuarios WHERE usuario_id = $1", [
      usuario_id,
    ]);
  } catch (error) {
    throw error;
  }
}
module.exports = {
  getAllUsers,
  getUserByEmail,
  createUser,
  updateUser,
  getUserById,
  deleteUser,
};
