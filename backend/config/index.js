const pool = require("../config/db.js");
const express = require("express");
const userRoutes = require("../route/userRoute.js");
const clientRoutes = require("../route/clientRoute.js");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Permite conexiones solo desde este origen
  })
);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);

// Función para iniciar el servidor
async function iniciar() {
  try {
    // Verifica la conexión (opcional)
    await pool.connect();
    console.log("Conexión a la base de datos exitosa.");

    // Iniciar el servidor
    app.listen(3000, () => {
      console.log("Servidor ejecutándose en http://localhost:3000");
    });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
}

iniciar();

module.exports = pool;
