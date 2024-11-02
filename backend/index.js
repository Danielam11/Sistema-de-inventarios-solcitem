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
});

// Ejemplo de cómo hacer una consulta a la base de datos
const testConnection = async () => {
  try {
    const client = await pool.connect(); // Conectar al pool
    const res = await client.query("SELECT NOW()"); // Realizar una consulta
    console.log("La hora actual es:", res.rows[0].now); // Mostrar el resultado
    client.release(); // Liberar el cliente
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
  }
};

// Llamar a la función para probar la conexión
testConnection();
