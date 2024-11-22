const clientModel = require("../model/clientModel");

async function getAllClients(req, res) {
  try {
    const clients = await clientModel.getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error al obtener los clientes", error);
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
}

async function getClientById(req, res) {
  const { id } = req.params;
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

async function createClient(req, res) {
  const { identificacion, nombre, direccion, telefono, email } = req.body;

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

async function updateClient(req, res) {
  const { id } = req.params;
  const { identificacion, nombre, direccion, telefono, email } = req.body;

  try {
    const client = await clientModel.getClientById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

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

async function deleteClient(req, res) {
  const { id } = req.params;

  try {
    const client = await clientModel.getClientById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

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
