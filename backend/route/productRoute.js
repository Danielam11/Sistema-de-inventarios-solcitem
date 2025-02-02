const express = require("express");
const productController = require("../controller/productController");

const router = express.Router();

router.get("/", productController.getAllProducts); // Obtener todos los productos
router.post("/", productController.createProduct); // Crear un nuevo producto
router.get("/:id", productController.getProductById); // Obtener un producto por ID
router.put("/:id", productController.updateProduct); // Actualizar un producto
router.delete("/:id", productController.deleteProduct); // Eliminar un producto
router.get("/bySupplier/:proveedorId", productController.getProductsBySupplier);

module.exports = router;
