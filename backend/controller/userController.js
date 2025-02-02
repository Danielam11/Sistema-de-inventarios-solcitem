const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("error al obtener usuarios", error);
    res.status(500).json({ error: "error al obtener usuarios" });
  }
}

async function registerUser(req, res) {
  const { email, password, rol } = req.body;

  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .json({ error: "El correo electrónico ya está registrado" });
  }

  // Encriptamos la contraseña antes de guardarla
  const salt = await bcrypt.genSalt(10); // Generamos el salt
  const hashedPassword = await bcrypt.hash(password, salt); // Encriptamos la contraseña

  try {
    // Guardar el nuevo usuario en la base de datos con la contraseña encriptada
    const newUser = await userModel.createUser(email, hashedPassword, rol);
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      userId: newUser.usuario_id,
    });
  } catch (error) {
    console.error("Error al registrar el usuario", error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Comparamos la contraseña ingresada con la contraseña encriptada en la base de datos
    const isPasswordValid = await bcrypt.compare(password, user.contrasena);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    console.log("Clave secreta JWT:", process.env.JWT_SECRET);

    // Generamos un token JWT
    const token = jwt.sign(
      { 
        userId: user.usuario_id, 
        email: user.email, 
        rol: user.rol // Asegúrate de que `rol` existe en la base de datos
      }, 
      process.env.JWT_SECRET || "miCl4v3$3cR3tA!2024", 
      { expiresIn: "1h" }
    );

    // Enviar respuesta al cliente
    return res.status(200).json({
      message: "Login exitoso",
      token, // Devuelve el token generado
      userId: user.usuario_id,
    });

  } catch (error) {
    console.error("Error al iniciar sesión", error);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
}


async function editUser(req, res) {
  const { usuario_id } = req.params;
  const { email, password, rol } = req.body;

  try {
    // Verifica si el usuario existe
    const user = await userModel.getUserById(usuario_id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let hashedPassword = user.contrasena; // Mantén la contraseña actual

    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Actualiza el usuario con los valores proporcionados
    const updatedUser = await userModel.updateUser(
      usuario_id,
      email,
      hashedPassword,
      rol
    );

    res
      .status(200)
      .json({ message: "Usuario actualizado exitosamente", user: updatedUser });
  } catch (error) {
    console.error("Error al editar el usuario", error);
    res.status(500).json({ error: "Error al editar el usuario" });
  }
}

async function deleteUser(req, res) {
  const { usuario_id } = req.params;

  try {
    const user = await userModel.getUserById(usuario_id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await userModel.deleteUser(usuario_id);
    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el usuario", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
}

module.exports = {
  getUsers,
  loginUser,
  registerUser,
  editUser,
  deleteUser,
};
