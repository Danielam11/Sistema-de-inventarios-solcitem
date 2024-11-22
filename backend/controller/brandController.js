const marcaModel = require("../model/brandModel");

// Obtener todas las marcas
async function getAll(req, res) {
  try {
    const marcas = await marcaModel.getAllBrands();
    res.status(200).json(marcas);
  } catch (error) {
    console.error("Error al obtener las marcas", error);
    res.status(500).json({ error: "Error al obtener las marcas" });
  }
}

// Crear una nueva marca
async function create(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const nuevaMarca = await marcaModel.createBrand(nombre);
    res.status(201).json({
      message: "Marca creada exitosamente",
      marca: nuevaMarca,
    });
  } catch (error) {
    console.error("Error al crear la marca", error);
    res.status(500).json({ error: "Error al crear la marca" });
  }
}

// Obtener una marca por ID
async function getById(req, res) {
  const { id } = req.params;

  try {
    const marca = await marcaModel.getBrandById(id);
    if (!marca) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }
    res.status(200).json(marca);
  } catch (error) {
    console.error("Error al obtener la marca", error);
    res.status(500).json({ error: "Error al obtener la marca" });
  }
}

// Eliminar una marca
async function remove(req, res) {
  const { id } = req.params;

  try {
    const marca = await marcaModel.getBrandById(id);
    if (!marca) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }

    await marcaModel.deleteBrand(id);
    res.status(200).json({ message: "Marca eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar la marca", error);
    res.status(500).json({ error: "Error al eliminar la marca" });
  }
}

module.exports = {
  getAll,
  create,
  getById,
  remove,
};
