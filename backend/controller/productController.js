const productModel = require("../model/productModel");

// Obtener todos los productos
async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener los productos", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
}

// Crear un nuevo producto
async function createProduct(req, res) {
  const {
    nombre,
    descripcion,
    precio_compra,
    precio_venta,
    cantidad,
    marca_id,
    categoria_id,
    modelo_id,
  } = req.body;

  try {
    const newProduct = await productModel.createProduct(
      nombre,
      descripcion,
      precio_compra,
      precio_venta,
      cantidad,
      marca_id,
      categoria_id,
      modelo_id
    );
    res.status(201).json({
      message: "Producto creado exitosamente",
      producto: newProduct,
    });
  } catch (error) {
    console.error("Error al crear el producto", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
}

// Obtener un producto por ID
async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener el producto", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
}

// Actualizar un producto
async function updateProduct(req, res) {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    precio_compra,
    precio_venta,
    cantidad,
    marca_id,
    categoria_id,
    modelo_id,
  } = req.body;

  try {
    const updatedProduct = await productModel.updateProduct(
      id,
      nombre,
      descripcion,
      precio_compra,
      precio_venta,
      cantidad,
      marca_id,
      categoria_id,
      modelo_id
    );
    res.status(200).json({
      message: "Producto actualizado exitosamente",
      producto: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar el producto", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
}

// Eliminar un producto
async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    await productModel.deleteProduct(id);
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
