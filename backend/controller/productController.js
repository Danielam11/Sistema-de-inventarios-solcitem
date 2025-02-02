const productModel = require("../model/productModel");

// Obtener todos los productos
async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
}

async function getProductsBySupplier(req, res) {
  try {
    const { proveedorId } = req.params;

    if (!proveedorId) {
      return res.status(400).json({ error: "El ID del proveedor es obligatorio." });
    }

    const products = await productModel.getProductsBySupplier(proveedorId);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    proveedor_ids,
  } = req.body;

  try {
    console.log("📥 Recibiendo datos del frontend:", req.body); // Verificar que los datos lleguen correctamente

    // Verificar que los datos son correctos
    if (typeof nombre !== "string" || typeof descripcion !== "string") {
      console.error("Error: `nombre` y `descripcion` deben ser strings.");
      return res.status(400).json({ error: "`nombre` y `descripcion` deben ser strings." });
    }

    const newProduct = await productModel.createProduct(
      nombre, // Pasar solo el string
      descripcion,
      parseFloat(precio_compra), // Asegurar que sea número
      parseFloat(precio_venta),
      parseInt(cantidad, 10), // Convertir a entero
      parseInt(marca_id, 10),
      parseInt(categoria_id, 10),
      parseInt(modelo_id, 10),
      Array.isArray(proveedor_ids) ? proveedor_ids.map(id => parseInt(id, 10)) : [] // Convertir proveedores a números
    );

    console.log("✅ Producto creado:", newProduct);
    res.status(201).json({ message: "Producto creado exitosamente", producto: newProduct });
  } catch (error) {
    console.error("❌ Error al crear el producto:", error);
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
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
}

// Actualizar un producto
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
    proveedor_ids,
  } = req.body;

  try {
    console.log("📥 Recibiendo datos para actualizar:", req.body);

    // Validar que `nombre` y `descripcion` sean strings
    if (typeof nombre !== "string" || typeof descripcion !== "string") {
      console.error("Error: `nombre` y `descripcion` deben ser strings.");
      return res.status(400).json({ error: "`nombre` y `descripcion` deben ser strings." });
    }

    // Convertir los datos a los tipos correctos
    const updatedProduct = await productModel.updateProduct(
      id,
      nombre, // Pasar solo el string
      descripcion,
      parseFloat(precio_compra), // Asegurar que sea número
      parseFloat(precio_venta),
      parseInt(cantidad, 10), // Convertir a entero
      parseInt(marca_id, 10),
      parseInt(categoria_id, 10),
      parseInt(modelo_id, 10),
      Array.isArray(proveedor_ids) ? proveedor_ids.map(id => parseInt(id, 10)) : [] // Convertir proveedores a números
    );

    console.log("✅ Producto actualizado:", updatedProduct);
    res.status(200).json({ message: "Producto actualizado exitosamente", producto: updatedProduct });
  } catch (error) {
    console.error("❌ Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
}


// **Eliminar un producto**
async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const product = await productModel.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await productModel.deleteProduct(id);
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
}

module.exports = { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct,getProductsBySupplier };
