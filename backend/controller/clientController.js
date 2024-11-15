const clientModel = require("../model/clientModel");

// Get all clients
async function getAllClients(req, res) {
  try {
    const clients = await clientModel.getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error al obtener los clientes", error);
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
}

// Get client by ID
async function getClientById(req, res) {
  const { id } = req.params; // Recibimos el ID del cliente que queremos obtener
  try {
    const client = await clientModel.getClientById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error("Error al obtener el cliente", error);
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
}

// Create a new client
async function createClient(req, res) {
  const { identificacion, nombre, direccion, telefono, email } = req.body;

  // Verificamos si el cliente ya existe
  const existingClient = await clientModel.getClientById(identificacion);
  if (existingClient) {
    return res.status(400).json({ error: "El cliente ya está registrado" });
  }

  try {
    const newClient = await clientModel.createClient(
      identificacion,
      nombre,
      direccion,
      telefono,
      email
    );
    res.status(201).json({
      message: "Cliente registrado exitosamente",
      clientId: newClient.cliente_id,
    });
  } catch (error) {
    console.error("Error al registrar el cliente", error);
    res.status(500).json({ error: "Error al registrar el cliente" });
  }
}

// Update an existing client
async function updateClient(req, res) {
  const { id } = req.params; // Recibimos el ID del cliente que queremos actualizar
  const { identificacion, nombre, direccion, telefono, email } = req.body;

  try {
    // Verificamos si el cliente existe
    const client = await clientModel.getClientById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Actualizamos el cliente en la base de datos
    const updatedClient = await clientModel.updateClient(
      id,
      identificacion,
      nombre,
      direccion,
      telefono,
      email
    );
    res.status(200).json({
      message: "Cliente actualizado exitosamente",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error al actualizar el cliente", error);
    res.status(500).json({ error: "Error al actualizar el cliente" });
  }
}

// Delete a client
async function deleteClient(req, res) {
  const { id } = req.params; // Recibimos el ID del cliente que queremos eliminar

  try {
    // Verificamos si el cliente existe
    const client = await clientModel.getClientById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Eliminamos el cliente de la base de datos
    await clientModel.deleteClient(id);
    res.status(200).json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el cliente", error);
    res.status(500).json({ error: "Error al eliminar el cliente" });
  }
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
