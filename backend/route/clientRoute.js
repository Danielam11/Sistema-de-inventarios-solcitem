const express = require("express");
const clientController = require("../controller/clientController");
const router = express.Router();

// Obtener todos los clientes
router.get("/", clientController.getAllClients);

// Obtener un cliente por ID
router.get("/:id", clientController.getClientById);

// Buscar cliente por identificación (usando query parameter)
router.get("/identificacion/:identificacion", clientController.getClientByIdentificacion);


// Crear un nuevo cliente
router.post("/", clientController.createClient);

// Actualizar un cliente existente
router.put("/:id", clientController.updateClient);

// Eliminar un cliente
router.delete("/:id", clientController.deleteClient);

module.exports = router;