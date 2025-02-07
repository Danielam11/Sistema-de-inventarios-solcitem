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

interface CreateSaleFormProps {
  onSaleCreated?: () => void;
}

export default function CreateSaleForm({ onSaleCreated }: CreateSaleFormProps) {
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [tipoIdentificacion, setTipoIdentificacion] = useState("CEDULA");

  const [medioPago, setMedioPago] = useState<string>("EFECTIVO"); // Nuevo estado
  const [productos, setProductos] = useState<
    {
      productoId: number;
      cantidad: number;
      descripcion?: string;
      valor?: number;
    }[]
  >([{ productoId: 0, cantidad: 1 }]);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [ivas, setIvas] = useState<any[]>([]);
  const [selectedIva, setSelectedIva] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [total, setTotal] = useState(0);
  const [newClient, setNewClient] = useState({
    identificacion: "",
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
  });
  // Validar Cédula
  const validarCedula = (cedula: string): boolean => {
    // Verificar que la cédula tenga 10 dígitos y sean solo números
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return false;
    }

    // Extraer los dos primeros dígitos (provincia)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
      return false; // Las provincias en Ecuador van del 1 al 24
    }

    // Extraer el último dígito (dígito verificador)
    const digitoVerificador = parseInt(cedula.charAt(9), 10);

    // Algoritmo de validación (módulo 10)
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let digito = parseInt(cedula.charAt(i), 10);
      if (i % 2 === 0) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }
      suma += digito;
    }

    const calculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return calculado === digitoVerificador;
  };
  // Validar RUC
  const validarRUC = (ruc: string): boolean => {
    // Verificar que el RUC tenga 13 dígitos y sean solo números
    if (!ruc || ruc.length !== 13 || !/^\d+$/.test(ruc)) {
      return false;
    }

    // Extraer los dos primeros dígitos (provincia)
    const provincia = parseInt(ruc.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
      return false; // Las provincias en Ecuador van del 1 al 24
    }

    // Extraer el tercer dígito (tipo de persona)
    const tipoPersona = parseInt(ruc.charAt(2), 10);

    // Validar según el tipo de persona
    if (tipoPersona < 0 || tipoPersona > 5) {
      return false; // Los tipos de persona van del 0 al 5
    }

    // Validar el establecimiento (últimos 3 dígitos)
    const establecimiento = parseInt(ruc.substring(10, 13), 10);
    if (establecimiento < 1) {
      return false; // El establecimiento no puede ser 000
    }

    // Si es persona natural (tipoPersona < 6), validar como cédula
    if (tipoPersona < 6) {
      return validarCedula(ruc.substring(0, 10));
    }

    // Para otros tipos de RUC (empresas, etc.), no se aplica la validación de cédula
    return true;
  };

  function notifySuccess(message: string) {
    if (!message) return;
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
    if (!message) return;
    toast.error(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  // Cargar datos iniciales (usuarios, clientes y productos)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, clientsResponse, productsResponse, ivasResponse] =
          await Promise.all([
            fetch("http://localhost:3000/api/users"),
            fetch("http://localhost:3000/api/clients"),
            fetch("http://localhost:3000/api/products"),
            fetch("http://localhost:3000/api/iva"),
          ]);

        if (
          !usersResponse.ok ||
          !clientsResponse.ok ||
          !productsResponse.ok ||
          !ivasResponse.ok
        ) {
          throw new Error("Error al cargar los datos iniciales");
        }

        const usersData = await usersResponse.json();
        const clientsData = await clientsResponse.json();
        const productsData = await productsResponse.json();
        const ivasData = await ivasResponse.json();

        setUsers(usersData);
        setClients(clientsData);
        setProducts(productsData);
        setIvas(ivasData);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los datos iniciales");
      }
    };

    fetchData();
  }, []);

  // Calcular el total de la venta con IVA
  useEffect(() => {
    let newTotal = 0;

    productos.forEach((producto) => {
      const selectedProduct = products.find(
        (p) => p.producto_id === producto.productoId
      );

      if (selectedProduct) {
        const precio = Number(selectedProduct.precio_venta) || 0;
        const cantidad = Number(producto.cantidad) || 0;
        newTotal += precio * cantidad;
      }
    });

    const iva = selectedIva / 100;
    const totalConIva = newTotal * (1 + iva);

    setTotal(parseFloat(totalConIva.toFixed(2)));
  }, [productos, products, selectedIva]);

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
        newProductos[index].valor = selectedProduct.precio_venta;
      }
    }

    setProductos(newProductos);
  };

  // Crear un nuevo cliente
  const handleCreateClient = async () => {
    if (!newClient.identificacion || !newClient.nombre) {
      toast.error("Todos los campos del cliente son obligatorios.");
      return null;
    }

    try {
      const response = await fetch("http://localhost:3000/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) throw new Error("Error al crear el cliente");

      const result = await response.json();
      return result.clientId;
    } catch (error) {
      toast.error("No se pudo crear el cliente.");
      return null;
    }
  };

  // Verificar si un cliente ya existe
  const checkIfClientExists = async (identificacion: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/clients/identificacion/${identificacion}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data?.cliente_id ?? null;
    } catch {
      return null;
    }
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
    console.log("handleSubmit se ha ejecutado"); // Mensaje de depuración
    console.log("Tipo de Identificación:", tipoIdentificacion);
    console.log("Identificación:", newClient.identificacion);
    try {
      // Validar campos obligatorios del cliente
      if (
        !newClient.identificacion ||
        !newClient.nombre ||
        !newClient.telefono
      ) {
        notifyError("Ingrese todos los campos obligatorios.");
        return;
      }

      if (!/^\d+$/.test(newClient.telefono)) {
        notifyError(
          "El teléfono no debe tener letras u otros caracteres especiales."
        );
        return;
      }

      if (
        tipoIdentificacion === "CEDULA" &&
        !validarCedula(newClient.identificacion)
      ) {
        notifyError("⚠️ Cédula inválida. Verifique e intente nuevamente.");
        return;
      }
      if (
        tipoIdentificacion === "RUC" &&
        !validarRUC(newClient.identificacion)
      ) {
        notifyError("⚠️ RUC inválido. Verifique e intente nuevamente.");
        return;
      }

      // Validar formato de teléfono (entre 10 y 15 caracteres)
      if (newClient.telefono.length < 10 || newClient.telefono.length > 15) {
        notifyError("El teléfono debe tener 10 caracteres.");
        return;
      }

      let clienteIdFinal = clienteId;

      // Verificar si el cliente ya existe o crear uno nuevo
      if (!clienteIdFinal && newClient.identificacion) {
        const clienteExistenteId = await checkIfClientExists(
          newClient.identificacion
        );
        if (clienteExistenteId) {
          clienteIdFinal = clienteExistenteId;
        } else {
          const clienteIdCreado = await handleCreateClient();
          if (!clienteIdCreado) {
            notifyError("No se puede crear un cliente");
            return;
          }
          clienteIdFinal = clienteIdCreado;
        }
        setClienteId(clienteIdFinal);
      }

      // Obtener el userId desde el token
      const usuarioId = getUserIdFromToken();
      if (!usuarioId) {
        notifyError("No se pudo obtener el ID del usuario.");
        return;
      }

      // Validar productos
      const productosInvalidos = productos.some(
        (producto) => !producto.productoId || producto.cantidad <= 0
      );
      if (productosInvalidos) {
        notifyError("Todos los productos deben tener una cantidad válida.");
        return;
      }

      for (const producto of productos) {
        const selectedProduct = products.find(
          (p) => p.producto_id === producto.productoId
        );

        if (!selectedProduct) {
          notifyError(`El producto con ID ${producto.productoId} no existe.`);
          return;
        }

        if (producto.cantidad > selectedProduct.cantidad) {
          notifyError(
            `El producto "${selectedProduct.nombre}" solo tiene ${selectedProduct.cantidad} unidades en stock.`
          );
          return;
        }
      }

      // Crear la venta
      const ventaResponse = await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          usuarioId: Number(usuarioId),
          clienteId: Number(clienteIdFinal),
          total: total,
          medioPago: medioPago, // Se envía el medio de pago
        }),
      });

      if (!ventaResponse.ok) {
        const errorData = await ventaResponse.json();
        console.error("Error al crear la venta:", errorData); // Depuración
        throw new Error(errorData.message || "Error al crear la venta");
      }

      const ventaResult = await ventaResponse.json();
      const ventaId = ventaResult.sale.venta_id;

      // Crear los detalles de la venta
      for (const producto of productos) {
        const detalleResponse = await fetch(
          "http://localhost:3000/api/salesDetails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              ventaId: ventaId,
              productoId: producto.productoId,
              cantidadProductos: producto.cantidad,
            }),
          }
        );

        if (!detalleResponse.ok) {
          const errorData = await detalleResponse.json();
          throw new Error(
            errorData.message || "Error al crear el detalle de la venta"
          );
        }
      }

      notifySuccess("Venta y detalles creados exitosamente.");

      // Limpiar el formulario
      if (onSaleCreated) {
        onSaleCreated();
      }
      setUsuarioId("");
      setClienteId("");
      setProductos([{ productoId: 0, cantidad: 1 }]);
      setMedioPago("EFECTIVO"); // Reiniciar el medio de pago por defecto
      setNewClient({
        identificacion: "",
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
      });
    } catch (error) {
      console.error("Error en handleSubmit:", error); // Depuración
      notifyError(error.message || "No se pudo crear la venta o los detalles.");
    }
  };

  // Validación en tiempo real para la identificación

  return (
    <Box sx={{ padding: 1 }}>
      {/* Contenedor Cliente */}
      <Box sx={{ padding: 1.5, borderRadius: 1, mb: 2 }}>
        <Typography level="h5" sx={{ mb: 1, fontSize: "1rem" }}>
          Datos del titular
        </Typography>
        <Grid container spacing={3}>
          {/* Campo de tipo de identificación */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem" }}>
                Tipo de Identificación *
              </FormLabel>
              <Select
                value={tipoIdentificacion}
                onChange={(event, newValue) => {
                  setTipoIdentificacion(newValue as "CEDULA" | "RUC");
                  setNewClient({ ...newClient, identificacion: "" }); // Resetear input
                }}
              >
                <Option value="CEDULA">Cédula</Option>
                <Option value="RUC">RUC</Option>
              </Select>
            </FormControl>
          </Grid>

          {/* Campo de Identificación */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem" }}>
                Identificación *
              </FormLabel>
              <Input
                size="sm"
                value={newClient.identificacion}
                onChange={(e) => {
                  setNewClient({
                    ...newClient,
                    identificacion: e.target.value,
                  });
                }}
                slotProps={{ input: { maxLength: 13 } }}
              />
            </FormControl>
          </Grid>

          {/* Otros campos */}
          {[
            { label: "Nombre Completo *", key: "nombre", maxLength: 40 },
            { label: "Dirección", key: "direccion", maxLength: 40 },
            { label: "Teléfono *", key: "telefono", maxLength: 10 },
          ].map(({ label, key, maxLength }) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "0.875rem" }}>{label}</FormLabel>
                <Input
                  size="sm"
                  value={newClient[key]}
                  onChange={(e) => {
                    setNewClient({ ...newClient, [key]: e.target.value });
                  }}
                  slotProps={{ input: { maxLength } }}
                />
              </FormControl>
            </Grid>
          ))}

          {/* Campo de Correo */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "0.875rem" }}>Correo</FormLabel>
              <Input
                size="sm"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                slotProps={{ input: { maxLength: 30 } }}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Contenedor Venta y Productos */}
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
          Detalle de la Venta
        </Typography>

        {/* Tabla de productos */}
        <Box
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            padding: 1,
          }}
        >
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
                  ? selectedProduct.precio_venta
                  : 0;
                const subtotal = precioUnitario * producto.cantidad;

                return (
                  <tr key={index}>
                    <td>
                      <Button
                        size="sm"
                        variant="plain" // Hace que el botón no tenga relleno de color
                        sx={{
                          minHeight: "30px", // Ajusta la altura mínima
                          padding: "4px 8px", // Ajusta el relleno para que no se vea vacío
                          border: "1px solid", // Opción: añade un borde si lo deseas
                          display: "flex", // Para centrar el contenido correctamente
                          alignItems: "center",
                          gap: "4px", // Espaciado entre el icono y el texto
                        }}
                        onClick={() => handleOpenModal(index)}
                        startDecorator={!selectedProduct && <SearchIcon />} // Usa startDecorator correctamente
                      >
                        {selectedProduct
                          ? selectedProduct.nombre
                          : "Seleccionar"}
                      </Button>
                    </td>
                    <td>{selectedProduct?.marca_nombre || "-"}</td>
                    <td>{selectedProduct?.modelo_nombre || "-"}</td>
                    <td>
                      <Input
                        size="sm"
                        type="number"
                        slotProps={{
                          input: {
                            min: 0,
                            max: 100,
                          },
                        }}
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

        {/* Tabla de IVA, Total y Guardar Venta */}
        <Table sx={{ mt: 1, width: "100%", fontSize: "0.8rem" }}>
          <tbody>
            {/* Fila del IVA y Medio de Pago en el mismo Box */}
            <tr style={{ height: "28px" }}>
              <td style={{ width: "50%", borderTop: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end", // Alinea el grupo al final de la fila
                    alignItems: "center", // Alinea verticalmente los elementos
                    width: "100%",
                  }}
                >
                  {/* Medio de Pago */}
                  <FormControl sx={{ minWidth: "150px", marginRight: "16px" }}>
                    <FormLabel sx={{ fontSize: "0.75rem" }}>
                      Medio de Pago
                    </FormLabel>
                    <Select
                      value={medioPago}
                      onChange={(e, newValue) => setMedioPago(newValue)}
                      sx={{
                        minHeight: "26px",
                        fontSize: "0.9rem",
                        padding: "2px 6px",
                        minWidth: "200px",
                      }}
                    >
                      <Option value="TRANSFERENCIA">Transferencia</Option>
                      <Option value="EFECTIVO">Efectivo</Option>
                    </Select>
                  </FormControl>

                  {/* IVA */}
                  <FormControl sx={{ minWidth: "150px" }}>
                    <FormLabel sx={{ fontSize: "0.75rem" }}>IVA</FormLabel>
                    <Select
                      name="iva"
                      value={selectedIva || ""}
                      onChange={(event, newValue) => {
                        if (newValue !== null && newValue !== undefined) {
                          setSelectedIva(Number(newValue));
                        }
                      }}
                      sx={{
                        minHeight: "26px",
                        fontSize: "0.9rem",
                        padding: "2px 6px",
                        minWidth: "200px",
                      }}
                    >
                      {ivas.map((iva) => (
                        <Option key={iva.iva_id} value={iva.porcentaje}>
                          {iva.porcentaje}%
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </td>
            </tr>

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

            {/* Fila con el Botón de Guardar Venta */}
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
                    Guardar Venta
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
