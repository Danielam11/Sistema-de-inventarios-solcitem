/*
require("dotenv").config();

const { Pool } = require("pg");

// Configuración del pool de conexión
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  // Si decides deshabilitar SSL, puedes poner esto en false
  ssl: { rejectUnauthorized: false },
}); */

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "1234",
  database: "pruebatesis",
  port: 5432,
});

module.exports = pool;
