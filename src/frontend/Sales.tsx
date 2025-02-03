import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import IconButton from "@mui/joy/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { CSVLink } from "react-csv"; // Importar CSVLink
import iconCSV from "../assets/microsoft-excel-2019.png"; // Importa la imagen

// Función para obtener las ventas
function fetchSales(setSales: (data: any[]) => void) {
  fetch("http://localhost:3000/api/sales")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      setSales(data);
    })
    .catch((error) => console.error("Error fetching sales:", error));
}

// Función para obtener los productos
function fetchProducts(setProducts: (data: any[]) => void) {
  fetch("http://localhost:3000/api/products")
    .then((response) => response.json())
    .then((data) => {
      setProducts(data);
    })
    .catch((error) => console.error("Error fetching products:", error));
}

// Función para obtener los clientes
function fetchClients(setClients: (data: any[]) => void) {
  fetch("http://localhost:3000/api/clients")
    .then((response) => response.json())
    .then((data) => {
      setClients(data);
    })
    .catch((error) => console.error("Error fetching clients:", error));
}

// Función para obtener los usuarios
function fetchUsers(setUsers: (data: any[]) => void) {
  fetch("http://localhost:3000/api/users")
    .then((response) => response.json())
    .then((data) => {
      setUsers(data);
    })
    .catch((error) => console.error("Error fetching users:", error));
}

// Función para eliminar una venta
function deleteSale(
  saleId: number,
  onSuccess: () => void,
  onError: (error: any) => void
) {
  fetch(`http://localhost:3000/api/sales/${saleId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al eliminar la venta");
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

// Función para obtener los detalles de una venta
function fetchSaleDetails(saleId: number, setDetails: (data: any[]) => void) {
  fetch(`http://localhost:3000/api/salesDetails/${saleId}`)
    .then((response) => response.json())
    .then((data) => {
      setDetails(data);
    })
    .catch((error) => console.error("Error fetching sale details:", error));
}

export default function SalesTable() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [saleDetails, setSaleDetails] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fecha, setFecha] = useState("");
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [productos, setProductos] = useState([
    { productoId: 0, cantidad: 1, detalleId: null },
  ]);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [productosToDelete, setProductosToDelete] = useState<number[]>([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const totalSum = filteredSales.reduce(
    (sum, sale) => sum + parseFloat(sale.total),
    0
  );

  console.log("filteredSales:", filteredSales);
  console.log("totalSum:", totalSum);
  const [newClient, setNewClient] = useState({
    cliente_id: "",
    identificacion: "",
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
  });
  const [isDetailsLoaded, setIsDetailsLoaded] = useState(false);
  useEffect(() => {
    fetchSales(setSales);
    fetchUsers(setUsers);
    fetchClients(setClients);
    fetchProducts(setProducts);
  }, []);

  const handleDelete = (saleId: number) => {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p>¿Estás seguro de que deseas eliminar esta venta?</p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => {
                deleteSale(
                  saleId,
                  () => {
                    setSales((prevSales) =>
                      prevSales.filter((s) => s.venta_id !== saleId)
                    );
                    toast.success("Venta eliminada exitosamente.");
                    closeToast();
                  },
                  (error) => {
                    console.error("Error al eliminar la venta:", error);
                    toast.error("No se pudo eliminar la venta.");
                    closeToast();
                  }
                );
              }}
            >
              Confirmar
            </button>
            <button onClick={closeToast}>Cancelar</button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
      }
    );
  };

  const handleExpand = (saleId: number) => {
    if (expandedRow === saleId) {
      setExpandedRow(null);
      setSaleDetails([]);
    } else {
      setExpandedRow(saleId);
      fetchSaleDetails(saleId, setSaleDetails);
    }
  };

  const handleAddProduct = () => {
    setProductos([
      ...productos,
      { productoId: 0, cantidad: 1, detalleId: null },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    const producto = productos[index];
    if (producto.detalleId) {
      setProductosToDelete([...productosToDelete, producto.detalleId]);
    }
    const newProductos = [...productos];
    newProductos.splice(index, 1);
    setProductos(newProductos);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newProductos = [...productos];
    newProductos[index] = { ...newProductos[index], [field]: value };
    setProductos(newProductos);
  };

  const handleEditClick = (sale: any) => {
    setIsEditModalOpen(true);
    setProductosToDelete([]);
    setIsDetailsLoaded(false); // Inicialmente, los detalles no están cargados

    // Formatear la fecha al formato yyyy-MM-dd
    const fechaFormateada = new Date(sale.fecha_venta)
      .toISOString()
      .split("T")[0];

    // Actualizar el estado con los datos de la venta
    setEditingSale({
      venta_id: sale.venta_id,
      fecha_venta: fechaFormateada,
      clienteId: sale.cliente_id, // Usar cliente_id
      usuarioId: sale.usuario_id, // Usar usuario_id
      total: sale.total,
      subtotal: sale.subtotal,
    });

    fetchSaleDetails(sale.venta_id, (details) => {
      const productosEdit = details.map((detail) => {
        return {
          detalleId: detail.detalle_id,
          productoId: detail.producto_id,
          cantidad: detail.cantidad_productos,
        };
      });
      setProductos(productosEdit);
      setIsDetailsLoaded(true); // Marcar los detalles como cargados
    });
  };

  const handleEditSave = async () => {
    if (!editingSale) return;

    const ventaData = {
      fecha_venta: editingSale.fecha_venta,
      clienteId: editingSale.clienteId, // Enviar clienteId
      usuarioId: editingSale.usuarioId, // Enviar usuarioId
    };

    try {
      // Paso 1: Actualizar la venta
      const ventaResponse = await fetch(
        `http://localhost:3000/api/sales/${editingSale.venta_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ventaData),
        }
      );

      const ventaResult = await ventaResponse.json();
      console.log("Respuesta de la API al actualizar la venta:", ventaResult);

      if (!ventaResponse.ok) {
        throw new Error(ventaResult.error || "Error al actualizar la venta");
      }

      // Paso 2: Eliminar los productos marcados para eliminar
      for (const detalleId of productosToDelete) {
        const deleteResponse = await fetch(
          `http://localhost:3000/api/salesDetails/${detalleId}`,
          {
            method: "DELETE",
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Error al eliminar el detalle de venta");
        }
      }

      // Paso 3: Actualizar los detalles de la venta
      for (const producto of productos) {
        const detalleData = {
          ventaId: editingSale.venta_id,
          productoId: producto.productoId,
          cantidadProductos: producto.cantidad,
        };

        if (producto.detalleId) {
          // Actualizar detalle existente
          const detalleResponse = await fetch(
            `http://localhost:3000/api/salesDetails/${producto.detalleId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(detalleData),
            }
          );

          const detalleResult = await detalleResponse.json();
          console.log(
            "Respuesta de la API al actualizar el detalle:",
            detalleResult
          );

          if (!detalleResponse.ok) {
            throw new Error(
              detalleResult.error ||
                "Error al actualizar el detalle de la venta"
            );
          }
        } else {
          // Crear nuevo detalle
          const detalleResponse = await fetch(
            `http://localhost:3000/api/salesDetails`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(detalleData),
            }
          );

          const detalleResult = await detalleResponse.json();
          console.log(
            "Respuesta de la API al crear el detalle:",
            detalleResult
          );

          if (!detalleResponse.ok) {
            throw new Error(
              detalleResult.error || "Error al crear el detalle de la venta"
            );
          }
        }
      }

      toast.success("Venta y detalles actualizados exitosamente.");
      setIsEditModalOpen(false);
      fetchSales(setSales);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo actualizar la venta o los detalles.");
    }
  };
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setIsDetailsLoaded(false); // Restablecer el estado de carga de detalles
    setProductos([{ productoId: 0, cantidad: 1, detalleId: null }]);
    setProductosToDelete([]);
  };

  const handleCreateClient = async () => {
    try {
      // Validar que todos los campos del cliente estén completos
      if (
        !newClient.identificacion ||
        !newClient.nombre ||
        !newClient.direccion ||
        !newClient.telefono ||
        !newClient.email
      ) {
        toast.error("Todos los campos del cliente son obligatorios.");
        return null;
      }

      // Crear el cliente
      const response = await fetch("http://localhost:3000/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient), // Envía todos los campos del cliente
      });
      console.log("datos en handleCreateClient", newClient);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al crear el cliente");
      }
      console.log("Cliente creado con éxito:", result);
      console.log("Cliente result.cliente_id :", result.cliente_id);

      // Devuelve el ID del cliente creado
      return result.clientId;
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo crear el cliente.");
      return null;
    }
  };
  const checkIfClientExists = async (identificacion: string) => {
    console.log("identificacion", identificacion);
    try {
      const response = await fetch(
        `http://localhost:3000/api/clients/identificacion/${identificacion}`
      );
      console.log("response", response);

      if (!response.ok) {
        // Si hay algún problema con la API, continúa sin crear error
        console.log("No se pudo verificar el cliente.");
        return null;
      }

      const data = await response.json();
      console.log("data:", data);

      if (data && data.cliente_id) {
        return data.cliente_id; // Devuelve el ID si la API responde con un cliente
      }

      if (Array.isArray(data) && data.length > 0) {
        return data[0].cliente_id; // Devuelve el ID si la API responde con un arreglo
      }

      return null; // Si no se encuentra el cliente, retorna null
    } catch (error) {
      console.error("Error al verificar el cliente:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      let clienteIdFinal = clienteId;

      // Paso 1: Verificar si el cliente existe
      if (!clienteIdFinal && newClient.identificacion) {
        console.log("Datos en handleSubmit:", newClient.identificacion);

        const clienteExistenteId = await checkIfClientExists(
          newClient.identificacion
        );
        if (clienteExistenteId) {
          // Si el cliente existe, se usa el ID
          clienteIdFinal = clienteExistenteId;
          setClienteId(clienteExistenteId);
          console.log("Cliente encontrado. ID:", clienteIdFinal);
        } else {
          // Si no existe, se crea un nuevo cliente automáticamente
          console.log("Cliente no encontrado. Creando nuevo cliente...");
          const clienteIdCreado = await handleCreateClient(); // Llamamos a la función para crear el cliente
          console.log("clienteIdCreado:", clienteIdCreado);
          if (!clienteIdCreado) {
            toast.error("No se pudo crear el cliente.");
            return;
          }
          clienteIdFinal = clienteIdCreado;
          console.log("clienteIdCreado2:", clienteIdCreado); // Usar el ID del cliente recién creado
          setClienteId(clienteIdCreado);
          console.log("Cliente creado con éxito. ID:", clienteIdFinal);
        }
      }

      // Validar que todos los campos estén completos
      if (!fecha || !usuarioId || !clienteIdFinal) {
        toast.error("Todos los campos son obligatorios.");
        return;
      }

      // Paso 2: Crear la venta
      const ventaData = {
        fecha_venta: fecha,
        usuarioId: Number(usuarioId),
        clienteId: Number(clienteIdFinal),
      };

      const ventaResponse = await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ventaData),
      });

      const ventaResult = await ventaResponse.json();
      if (!ventaResponse.ok) {
        throw new Error(ventaResult.error || "Error al crear la venta");
      }

      const ventaId = ventaResult.sale.venta_id;
      console.log("Venta creada. ID:", ventaId);

      // Paso 3: Crear los detalles de la venta
      for (const producto of productos) {
        const detalleData = {
          ventaId: ventaId,
          productoId: producto.productoId,
          cantidadProductos: producto.cantidad,
        };

        const detalleResponse = await fetch(
          "http://localhost:3000/api/salesDetails",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(detalleData),
          }
        );

        const detalleResult = await detalleResponse.json();
        if (!detalleResponse.ok) {
          throw new Error(
            detalleResult.error || "Error al crear el detalle de la venta"
          );
        }

        console.log("Detalle creado:", detalleResult);
      }

      // Éxito: Resetear el formulario y actualizar ventas
      toast.success("Venta y detalles creados exitosamente.");
      setIsCreateModalOpen(false);
      setFecha("");
      setUsuarioId("");
      setClienteId("");
      setProductos([{ productoId: 0, cantidad: 1, detalleId: null }]);
      setNewClient({
        cliente_id: "",
        identificacion: "",
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
      });
      fetchSales(setSales);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo crear la venta o los detalles.");
    }
  };
  const fetchSales = () => {
    fetch("http://localhost:3000/api/sales")
      .then((response) => response.json())
      .then((data) => {
        setSales(data);
        setFilteredSales(data);
      })
      .catch((error) => console.error("Error fetching sales:", error));
  };

  const filterSalesByDate = () => {
    if (!fromDate || !toDate) {
      toast.error("Selecciona ambas fechas para filtrar");
      return;
    }

    const fromDateTime = new Date(fromDate);
    const toDateTime = new Date(toDate);

    // Ajustar la fecha final al final del día (23:59:59)
    toDateTime.setHours(23, 59, 59, 999);

    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.fecha_venta);
      return saleDate >= fromDateTime && saleDate <= toDateTime;
    });

    setFilteredSales(filtered);
  };

  const totalVentasFiltradas = filteredSales.reduce(
    (sum, sale) => sum + parseFloat(sale.total || 0),
    0
  );
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");
    const segundos = String(date.getSeconds()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  };

  useEffect(() => {
    if (fromDate && toDate) {
      filterSalesByDate();
    } else {
      // Si no hay fechas seleccionadas, mostrar todas las ventas
      setFilteredSales(sales);
    }
  }, [fromDate, toDate, sales]);
  // Preparar los datos para exportar a CSV
  const csvData = [
    ...filteredSales.map((sale) => ({
      Fecha: formatFecha(sale.fecha_venta),
      Cliente: sale.cliente_nombre,
      Usuario: sale.usuario_nombre,
      Subtotal: `$${parseFloat(sale.subtotal).toFixed(2)}`,
      Total: `$${parseFloat(sale.total).toFixed(2)}`,
    })),
    // Fila adicional para el total
    {
      Fecha: "",
      Cliente: "",
      Usuario: "",
      Subtotal: "",
      Total: `$${totalVentasFiltradas.toFixed(2)}`,
    },
  ];

  return (
    <React.Fragment>
      <Box
        sx={{ display: "flex", gap: 1.5, padding: 2, alignItems: "flex-end" }}
      >
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Desde*</FormLabel>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Hasta*</FormLabel>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </FormControl>

        {/* Contenedor del botón CSV con margen superior */}
        <Box sx={{ marginTop: "16px" }}>
          <CSVLink
            data={csvData}
            filename={"ventas.csv"}
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              backgroundColor: "#008f39",
              color: "white",
              borderRadius: "4px",
              maxHeight: "40px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <img
              src={iconCSV}
              alt="Exportar"
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          </CSVLink>
        </Box>
      </Box>

      {/* Modal de Edición */}
      <Modal
        open={isEditModalOpen && isDetailsLoaded}
        onClose={handleCancelEdit}
      >
        <ModalDialog>
          <Typography component="h2">Editar Venta</Typography>
          {editingSale && (
            <Box sx={{ mt: 2 }}>
              {/* Campo de fecha */}
              <FormControl>
                <FormLabel>Fecha de la Venta</FormLabel>
                <Input
                  type="date"
                  value={editingSale.fecha_venta || ""}
                  onChange={(e) =>
                    setEditingSale({
                      ...editingSale,
                      fecha_venta: e.target.value,
                    })
                  }
                />
              </FormControl>

              {/* Campo de cliente */}
              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Select
                  value={editingSale.clienteId || ""}
                  onChange={(e, newValue) =>
                    setEditingSale({
                      ...editingSale,
                      clienteId: Number(newValue),
                    })
                  }
                >
                  {clients.map((client) => (
                    <Option key={client.cliente_id} value={client.cliente_id}>
                      {client.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              {/* Campo de usuario */}
              <FormControl>
                <FormLabel>Usuario</FormLabel>
                <Select
                  value={editingSale.usuarioId || ""}
                  onChange={(e, newValue) =>
                    setEditingSale({
                      ...editingSale,
                      usuarioId: Number(newValue),
                    })
                  }
                >
                  {users.map((user) => (
                    <Option key={user.usuario_id} value={user.usuario_id}>
                      {user.email}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              {/* Lista de productos */}
              <FormLabel>Productos</FormLabel>
              {productos.map((producto, index) => (
                <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Select
                    value={producto.productoId || 0}
                    onChange={(e, newValue) =>
                      handleProductChange(index, "productoId", Number(newValue))
                    }
                  >
                    {products.map((product) => (
                      <Option
                        key={product.producto_id}
                        value={product.producto_id}
                      >
                        {product.nombre}
                      </Option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    value={producto.cantidad || 1}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        "cantidad",
                        Number(e.target.value)
                      )
                    }
                  />
                  <Button
                    color="danger"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    Quitar
                  </Button>
                </Box>
              ))}

              {/* Botón para agregar más productos */}
              <Button onClick={handleAddProduct} sx={{ mt: 2 }}>
                Agregar Producto
              </Button>

              {/* Botones de acción */}
              <Box
                sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Button color="danger" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
                <Button onClick={handleEditSave}>Guardar</Button>
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>

      {/* Modal de Creación de Venta */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ModalDialog>
          <Typography component="h2">Crear Nueva Venta</Typography>
          <Box sx={{ mt: 2 }}>
            {/* Formulario para crear un nuevo cliente */}
            <Typography component="h3">Cliente</Typography>
            <FormControl>
              <FormLabel>Identificación</FormLabel>
              <Input
                value={newClient.identificacion}
                onChange={(e) =>
                  setNewClient({ ...newClient, identificacion: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={newClient.nombre}
                onChange={(e) =>
                  setNewClient({ ...newClient, nombre: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Dirección</FormLabel>
              <Input
                value={newClient.direccion}
                onChange={(e) =>
                  setNewClient({ ...newClient, direccion: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Input
                value={newClient.telefono}
                onChange={(e) =>
                  setNewClient({ ...newClient, telefono: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />
            </FormControl>

            {/* Campos para la venta */}
            <Typography component="h3" sx={{ mt: 2 }}>
              Datos de la Venta
            </Typography>
            <FormControl>
              <FormLabel>Fecha de la Venta</FormLabel>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Usuario</FormLabel>
              <Select
                value={usuarioId}
                onChange={(e, newValue) => setUsuarioId(Number(newValue))}
              >
                {users.map((user) => (
                  <Option key={user.usuario_id} value={user.usuario_id}>
                    {user.email}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Productos */}
            <FormLabel>Productos</FormLabel>
            {productos.map((producto, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Select
                  value={producto.productoId || 0}
                  onChange={(e, newValue) =>
                    handleProductChange(index, "productoId", Number(newValue))
                  }
                >
                  {products.map((product) => (
                    <Option
                      key={product.producto_id}
                      value={product.producto_id}
                    >
                      {product.nombre}
                    </Option>
                  ))}
                </Select>
                <Input
                  type="number"
                  value={producto.cantidad}
                  onChange={(e) =>
                    handleProductChange(
                      index,
                      "cantidad",
                      Number(e.target.value)
                    )
                  }
                />
                <Button
                  color="danger"
                  onClick={() => handleRemoveProduct(index)}
                >
                  Quitar
                </Button>
              </Box>
            ))}

            <Button onClick={handleAddProduct} sx={{ mt: 2 }}>
              Agregar Producto
            </Button>

            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                color="danger"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>Guardar</Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
      {/* Tabla de ventas */}
      <Sheet sx={{ width: "100%", overflow: "auto", borderRadius: "sm" }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th style={{ width: "50px" }}></th>
              <th style={{ width: "100px" }}>Venta ID</th>
              <th
                style={{
                  width: "200px",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Fecha
              </th>
              <th style={{ width: "150px" }}>Cliente</th>
              <th
                style={{
                  width: "200px",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Usuario
              </th>
              <th style={{ width: "100px" }}>Subtotal</th>{" "}
              {/* Subtotal primero */}
              <th style={{ width: "100px" }}>Total</th> {/* Total después */}
              <th style={{ width: "100px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => {
              // Formatear la fecha con hora en formato español
              const formattedDate = new Date(sale.fecha_venta).toLocaleString(
                "es-ES",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false, // Usa formato de 24 horas
                }
              );

              return (
                <React.Fragment key={sale.venta_id}>
                  <tr>
                    <td>
                      <IconButton onClick={() => handleExpand(sale.venta_id)}>
                        {expandedRow === sale.venta_id ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </td>
                    <td>{sale.venta_id}</td>
                    <td>{formattedDate}</td>
                    <td>{sale.cliente_nombre}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sale.usuario_nombre}
                    </td>
                    <td>{sale.subtotal}</td>
                    <td>{sale.total}</td>
                    <td>
                      <Dropdown>
                        <MenuButton
                          slots={{ root: IconButton }}
                          slotProps={{
                            root: { variant: "plain", color: "neutral" },
                          }}
                        >
                          ...
                        </MenuButton>
                        <Menu>
                          <MenuItem
                            color="danger"
                            onClick={() => handleDelete(sale.venta_id)}
                          >
                            Eliminar
                          </MenuItem>
                        </Menu>
                      </Dropdown>
                    </td>
                  </tr>

                  {expandedRow === sale.venta_id && (
                    <tr>
                      <td colSpan={8}>
                        <Table>
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Marca</th>
                              <th>Modelo</th>
                              <th>Cantidad</th>
                              <th>Precio Unitario</th>
                              <th>Subtotal Producto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {saleDetails.map((detail) => (
                              <tr key={detail.detalle_id}>
                                <td>{detail.producto_nombre}</td>
                                <td>{detail.marca_nombre}</td>
                                <td>{detail.modelo_nombre}</td>
                                <td>{detail.cantidad_productos}</td>
                                <td>{detail.precio_unitario}</td>
                                <td>{detail.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Total:
              </td>
              <td
                style={{
                  fontWeight: "bold",
                }}
              >
                ${totalSum.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
      </Sheet>

      <ToastContainer />
    </React.Fragment>
  );
}
