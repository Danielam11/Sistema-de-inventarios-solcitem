// controllers/IVAController.js
const IVA = require("../model/ivaModel.js");

async function getAll(req, res) {
  try {
    const ivas = await IVA.getAllIVA();
    res.status(200).json(ivas);
  } catch (error) {
    console.error("Error al obtener los IVAs:", error);
    res.status(500).json({ error: "Error al obtener los IVAs" });
  }
}

async function create(req, res) {
  const { porcentaje, estado } = req.body;

  if (!porcentaje || estado === undefined) {
    return res.status(400).json({ error: 'Los campos "porcentaje" y "estado" son obligatorios' });
  }

  try {
    const nuevoIVA = await IVA.createIVA(porcentaje, estado);
    res.status(201).json(nuevoIVA);
  } catch (error) {
    console.error("Error al crear el IVA:", error);
    res.status(500).json({ error: "Error al crear el IVA" });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
    const iva = await IVA.getIVAById(id);
    if (!iva) {
      return res.status(404).json({ error: "IVA no encontrado" });
    }
    res.status(200).json(iva);
  } catch (error) {
    console.error("Error al obtener el IVA:", error);
    res.status(500).json({ error: "Error al obtener el IVA" });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const iva = await IVA.getIVAById(id);
    if (!iva) {
      return res.status(404).json({ error: "IVA no encontrado" });
    }

    await IVA.deleteIVA(id);
    res.status(200).json({ message: "IVA eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el IVA:", error);
    res.status(500).json({ error: "Error al eliminar el IVA" });
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
};