const pool = require("../config/db.js");
const express = require("express");
const userRoutes = require("../route/userRoute.js");
const clientRoutes = require("../route/clientRoute.js");
const supplierRoutes = require("../route/supplierRoute.js");
const brandRoutes = require("../route/brandRoute.js");
const modelRoutes = require("../route/modelRoute.js");
const categoryRoutes = require("../route/categoryRoute.js");
const productRoutes = require("../route/productRoute.js");
const saleRoutes = require("../route/saleRoute.js");
const orderRoutes = require("../route/orderRoute.js");
const saleDetailRoutes = require("../route/saleDetailRoute.js");
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
app.use("/api/suppliers", supplierRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/salesDetails",saleDetailRoutes);


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
