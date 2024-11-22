const model = require("../model/modelModel");

async function getAll(req, res) {
  try {
    const modelos = await model.getAllModels();
    res.status(200).json(modelos);
  } catch (error) {
    console.error("Error al obtener los modelos:", error);
    res.status(500).json({ error: "Error al obtener los modelos" });
  }
}

async function create(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
  }

  try {
    const nuevoModelo = await model.createModel(nombre);
    res.status(201).json(nuevoModelo);
  } catch (error) {
    console.error("Error al crear el modelo:", error);
    res.status(500).json({ error: "Error al crear el modelo" });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
    const modelo = await model.getModelById(id);
    if (!modelo) {
      return res.status(404).json({ error: "Modelo no encontrado" });
    }
    res.status(200).json(modelo);
  } catch (error) {
    console.error("Error al obtener el modelo:", error);
    res.status(500).json({ error: "Error al obtener el modelo" });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const modelo = await model.getModelById(id);
    if (!modelo) {
      return res.status(404).json({ error: "Modelo no encontrado" });
    }

    await model.deleteModel(id);
    res.status(200).json({ message: "Modelo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el modelo:", error);
    res.status(500).json({ error: "Error al eliminar el modelo" });
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
};
