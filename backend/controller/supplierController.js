const supplierModel = require("../model/supplierModel");

async function getAllSuppliers(req, res) {
  try {
    const suppliers = await supplierModel.getAllSuppliers();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error al obtener proveedores", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
}

async function getSupplierById(req, res) {
  const id = req.params.id;

  try {
    const supplier = await supplierModel.getSupplierById(id);
    if (!supplier) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error al obtener proveedor", error);
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
}

async function createSupplier(req, res) {
  const { identification, name, address, phone, email } = req.body;

  try {
    const newSupplier = await supplierModel.createSupplier(
      identification,
      name,
      address,
      phone,
      email
    );
    res.status(201).json({
      message: "Proveedor creado exitosamente",
      supplier: newSupplier,
    });
  } catch (error) {
    console.error("Error al crear proveedor", error);
    res.status(500).json({ error: "Error al crear proveedor" });
  }
}

async function updateSupplier(req, res) {
  const id = req.params.id;
  const { identification, name, address, phone, email } = req.body;

  try {
    const updatedSupplier = await supplierModel.updateSupplier(
      id,
      identification,
      name,
      address,
      phone,
      email
    );
    if (!updatedSupplier) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.status(200).json({
      message: "Proveedor actualizado exitosamente",
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("Error al actualizar proveedor", error);
    res.status(500).json({ error: "Error al actualizar proveedor" });
  }
}

async function deleteSupplier(req, res) {
  const id = req.params.id;

  try {
    const deleted = await supplierModel.deleteSupplier(id);
    if (!deleted) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.status(200).json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor", error);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
