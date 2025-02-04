import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Option,
  Typography,
  Table,
  Grid,
  Modal,
  Sheet,
} from "@mui/joy";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import SearchIcon from "@mui/icons-material/Search";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token"); // Obtener el token guardado
  if (!token) {
    console.error("No hay token disponible");
    return null;
  }

  const decodedToken = jwtDecode(token); // Decodificar el token
  return decodedToken.userId; // Obtener el userId desde el token
};

interface CreateOrderFormProps {
  onOrderCreated?: () => void;
}
function notifySuccess(message: string) {
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

function notifyError(message: string) {
  toast.error(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
export default function CreateOrderForm({
  onOrderCreated,
}: CreateOrderFormProps) {
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [proveedorId, setProveedorId] = useState<number | "">("");
  const [productos, setProductos] = useState<
    {
      productoId: number;
      cantidad: number;
      descripcion?: string;
      valor?: number;
    }[]
  >([{ productoId: 0, cantidad: 1 }]);
  const [users, setUsers] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [total, setTotal] = useState(0);

  // Cargar datos iniciales (usuarios, proveedores y productos)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, proveedoresResponse] = await Promise.all([
          fetch("http://localhost:3000/api/users"),
          fetch("http://localhost:3000/api/suppliers"),
        ]);

        if (!usersResponse.ok || !proveedoresResponse.ok) {
          throw new Error("Error al cargar los datos iniciales");
        }

        const usersData = await usersResponse.json();
        const proveedoresData = await proveedoresResponse.json();

        setUsers(usersData);
        setProveedores(proveedoresData);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los datos iniciales");
      }
    };

    fetchData();
  }, []); // Se ejecuta solo al montar el componente

  useEffect(() => {
    const fetchProductsBySupplier = async () => {
      if (!proveedorId) {
        setProducts([]); // Limpiar productos si no hay proveedor seleccionado
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/products/bySupplier/${proveedorId}`
        );

        if (!response.ok) {
          throw new Error("Error al cargar productos del proveedor.");
        }

        const productsData = await response.json();
        setProducts(productsData); // Solo cargamos los productos de ese proveedor
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los productos del proveedor.");
      }
    };

    fetchProductsBySupplier();
  }, [proveedorId]); // Se ejecuta cada vez que `proveedorId` cambie

  // Calcular el total del pedido
  useEffect(() => {
    let newTotal = 0;

    productos.forEach((producto) => {
      const selectedProduct = products.find(
        (p) => p.producto_id === producto.productoId
      );

      if (selectedProduct) {
        const precio = Number(selectedProduct.precio_compra) || 0;
        const cantidad = Number(producto.cantidad) || 0;
        newTotal += precio * cantidad;
      }
    });

    setTotal(parseFloat(newTotal.toFixed(2)));
  }, [productos, products]);

  // Agregar un nuevo producto
  const handleAddProduct = () => {
    setProductos([...productos, { productoId: 0, cantidad: 1 }]);
  };

  // Eliminar un producto
  const handleRemoveProduct = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Manejar cambios en los productos
  const handleProductChange = (index: number, field: string, value: any) => {
    const newProductos = [...productos];
    newProductos[index] = { ...newProductos[index], [field]: value };

    if (field === "productoId") {
      const selectedProduct = products.find((p) => p.producto_id === value);
      if (selectedProduct) {
        newProductos[index].descripcion = selectedProduct.nombre;
        newProductos[index].valor = selectedProduct.precio_compra;
      }
    }

    setProductos(newProductos);
  };

  const handleOpenModal = (index: number) => {
    setSelectedProductIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProductIndex(null);
  };

  const handleSelectProduct = (productoId: number) => {
    if (selectedProductIndex !== null) {
      handleProductChange(selectedProductIndex, "productoId", productoId);
      handleCloseModal();
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      // Validar que el usuario esté autenticado
      const usuarioId = getUserIdFromToken();
      if (!usuarioId) {
        notifyError(
          "No se pudo obtener el ID del usuario. Inicia sesión nuevamente."
        );
        return;
      }

      // Validar que se haya seleccionado un proveedor
      if (!proveedorId) {
        notifyError("Debes seleccionar un proveedor.");
        return;
      }

      // Validar que haya al menos un producto en el pedido
      if (productos.length === 0) {
        notifyError("Debes agregar al menos un producto al pedido.");
        return;
      }

      // Validar que todos los productos tengan un ID y una cantidad válida
      const productosInvalidos = productos.some(
        (producto) => !producto.productoId || producto.cantidad <= 0
      );
      if (productosInvalidos) {
        notifyError("Debe seleccionar un producto y cantidad válida.");
        return;
      }

      // Construir la estructura del pedido con los detalles incluidos
      const pedidoData = {
        usuarioId: Number(usuarioId),
        proveedorId: Number(proveedorId),
        total: total,
        detalles: productos.map((producto) => ({
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.valor,
          subtotal: producto.valor * producto.cantidad,
        })),
      };

      console.log("Datos del pedido enviados:", pedidoData); // Depuración

      // Enviar el pedido con sus detalles en una sola solicitud
      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al crear el pedido:", errorData); // Depuración
        throw new Error(errorData.message || "Error al crear el pedido");
      }

      // Pedido creado exitosamente
      notifySuccess("Pedido y detalles creados exitosamente.");

      // Limpiar el formulario
      if (onOrderCreated) {
        onOrderCreated();
      }
      setUsuarioId("");
      setProveedorId("");
      setProductos([{ productoId: 0, cantidad: 1 }]);
    } catch (error) {
      console.error("Error en handleSubmit:", error); // Depuración
      notifyError(
        error.message || "No se pudo crear el pedido o los detalles."
      );
    }
  };
  return (
    <Box sx={{ padding: 1 }}>
      {/* Contenedor Proveedor */}
      <Box sx={{ padding: 1.5, borderRadius: 1, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem" }}>Proveedor *</FormLabel>
              <Select
                value={proveedorId || ""}
                onChange={(event, newValue) => {
                  if (newValue !== null && newValue !== undefined) {
                    setProveedorId(Number(newValue)); // Se actualizará y cargará los productos
                  }
                }}
                sx={{ minHeight: "40px" }}
              >
                {proveedores.map((proveedor) => (
                  <Option
                    key={proveedor.proveedor_id}
                    value={proveedor.proveedor_id}
                  >
                    {proveedor.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Contenedor Pedido y Productos */}
      <Box
        sx={{
          padding: 1.5,
          borderRadius: 1,
          borderTop: "2px solid #1976d2",
          overflowY: "auto",
        }}
      >
        <Typography
          level="h5"
          sx={{ mb: 1, fontSize: "1rem", marginBottom: "0" }}
        >
          Detalle del Pedido
        </Typography>

        {/* Tabla de productos */}
        <Box sx={{ maxHeight: 200, overflowY: "auto", padding: 1 }}>
          <Table sx={{ mt: 2, overflowY: "auto" }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cantidad</th>
                <th>Cantidad Existente</th>
                <th>Precio Unitario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => {
                const selectedProduct = products.find(
                  (p) => p.producto_id === producto.productoId
                );

                const precioUnitario = selectedProduct
                  ? selectedProduct.precio_compra
                  : 0;
                const subtotal = precioUnitario * producto.cantidad;

                return (
                  <tr key={index}>
                    <td>
                      <Button
                        size="sm"
                        variant="plain"
                        sx={{
                          minHeight: "30px",
                          padding: "4px 8px",
                          border: "1px solid",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onClick={() => handleOpenModal(index)}
                        startDecorator={!selectedProduct && <SearchIcon />}
                      >
                        {selectedProduct
                          ? selectedProduct.nombre
                          : "Seleccionar"}
                      </Button>
                    </td>
                    <td>{selectedProduct?.marca_id || "-"}</td>
                    <td>{selectedProduct?.modelo_nombre || "-"}</td>
                    <td>
                      <Input
                        size="sm"
                        type="number"
                        value={producto.cantidad}
                        onChange={(e) =>
                          handleProductChange(index, "cantidad", e.target.value)
                        }
                      />
                    </td>
                    <td>{selectedProduct?.cantidad || "-"}</td>
                    <td>${precioUnitario}</td>
                    <td>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        Quitar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Button size="sm" onClick={handleAddProduct} sx={{ mt: 1 }}>
            Agregar Producto
          </Button>
        </Box>

        {/* Tabla de Total y Guardar Pedido */}
        <Table sx={{ mt: 1, width: "100%", fontSize: "0.8rem" }}>
          <tbody>
            {/* Fila del Total */}
            <tr style={{ height: "28px" }}>
              <td style={{ width: "50%", borderTop: 0 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Box
                    sx={{
                      padding: "6px 12px",
                      border: "1px solid #007bff",
                      borderRadius: "4px",
                      minWidth: "200px",
                      display: "flex",
                      justifyContent: "flex-start",
                      fontSize: "1 rem",
                    }}
                  >
                    <Typography level="h6">Total: ${total}</Typography>
                  </Box>
                </Box>
              </td>
            </tr>

            {/* Fila con el Botón de Guardar Pedido */}
            <tr style={{ height: "28px" }}>
              <td style={{ width: "50%", borderTop: 0 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    sx={{
                      padding: "6px 12px",
                      fontSize: "1 rem",
                      minWidth: "200px",
                      minHeight: "28px",
                      backgroundColor: "#007bff",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#0056b3",
                      },
                    }}
                  >
                    Guardar Pedido
                  </Button>
                </Box>
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>

      {/* Modal para seleccionar productos */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ width: "80%", maxWidth: 1000, margin: "auto", mt: 5 }}>
          <Sheet sx={{ width: "100%", overflow: "auto", borderRadius: "sm" }}>
            <Table stickyHeader sx={{ tableLayout: "auto" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Producto Id</th>
                  <th style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                    Nombre
                  </th>
                  <th style={{ maxWidth: "210px", wordWrap: "break-word" }}>
                    Descripción
                  </th>
                  <th>Precio Compra</th>
                  <th>Precio Venta</th>
                  <th style={{ maxWidth: "150px", textAlign: "center" }}>
                    Cantidad
                  </th>
                  <th style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                    Marca
                  </th>
                  <th style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                    Modelo
                  </th>
                  <th style={{ maxWidth: "210px", wordWrap: "break-word" }}>
                    Categoría
                  </th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((producto) => (
                  <tr key={producto.producto_id}>
                    <td style={{ textAlign: "center", width: "50px" }}>
                      {producto.producto_id}
                    </td>
                    <td style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                      {producto.nombre}
                    </td>
                    <td style={{ maxWidth: "210px", wordWrap: "break-word" }}>
                      {producto.descripcion}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {producto.precio_compra}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {producto.precio_venta}
                    </td>
                    <td style={{ maxWidth: "150px", textAlign: "center" }}>
                      {producto.cantidad}
                    </td>
                    <td style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                      {producto.marca_nombre}
                    </td>
                    <td style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                      {producto.modelo_nombre}
                    </td>
                    <td style={{ maxWidth: "210px", wordWrap: "break-word" }}>
                      {producto.categoria_nombre}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleSelectProduct(producto.producto_id)
                        }
                      >
                        Seleccionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Box>
      </Modal>
      <ToastContainer />
    </Box>
  );
}
