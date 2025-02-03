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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink } from "react-csv"; // Importar CSVLink
import iconCSV from "../assets/microsoft-excel-2019.png"; // Importa la imagen
import { Height } from "@mui/icons-material";

function fetchPedidos(setPedidos: (data: any[]) => void) {
  fetch("http://localhost:3000/api/orders")
    .then((response) => response.json())
    .then((data) => {
      setPedidos(data);
    })
    .catch((error) => console.error("Error fetching orders:", error));
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

function fetchOrderById(orderId: number, setOrderDetails: (data: any) => void) {
  fetch(`http://localhost:3000/api/orders/${orderId}`)
    .then((response) => response.json())
    .then((data) => {
      setOrderDetails(data);
    })
    .catch((error) => console.error("Error fetching order details:", error));
}

export default function OrderTable() {
  const [pedidosOriginales, setPedidosOriginales] = useState<any[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    fetchPedidos((data) => {
      setPedidosOriginales(data);
      setPedidosFiltrados(data);
    });
  }, []);

  useEffect(() => {
    if (!fromDate || !toDate) {
      setPedidosFiltrados(pedidosOriginales);
      return;
    }

    const fromDateTime = new Date(fromDate);
    const toDateTime = new Date(toDate);
    toDateTime.setHours(23, 59, 59, 999);

    const filtered = pedidosOriginales.filter((pedido) => {
      const orderDate = new Date(pedido.fecha_pedido);
      return orderDate >= fromDateTime && orderDate <= toDateTime;
    });

    setPedidosFiltrados(filtered);
  }, [fromDate, toDate, pedidosOriginales]);

  const totalPedidosFiltrados = pedidosFiltrados.reduce(
    (sum, pedido) => sum + parseFloat(pedido.total || 0),
    0
  );

  const handleExpand = (orderId: number) => {
    if (expandedRow === orderId) {
      setExpandedRow(null);
      setOrderDetails(null);
    } else {
      setExpandedRow(orderId);
      fetchOrderById(orderId, setOrderDetails);
    }
  };
  function deletePedido(pedidoId: number) {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p>¿Estás seguro de que deseas eliminar este pedido?</p>
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
                fetch(`http://localhost:3000/api/orders/${pedidoId}`, {
                  method: "DELETE",
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error("Error al eliminar el pedido");
                    }
                    return response.json();
                  })
                  .then(() => {
                    toast.success("Pedido eliminado correctamente");
                    setPedidosFiltrados((prevPedidos) =>
                      prevPedidos.filter(
                        (pedido) => pedido.pedido_id !== pedidoId
                      )
                    );
                    setPedidosOriginales((prevPedidos) =>
                      prevPedidos.filter(
                        (pedido) => pedido.pedido_id !== pedidoId
                      )
                    );
                    closeToast();
                  })
                  .catch((error) => {
                    console.error("Error al eliminar el pedido:", error);
                    toast.error("No se pudo eliminar el pedido");
                    closeToast();
                  });
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
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");
    const segundos = String(date.getSeconds()).padStart(2, "0");

    return `${dia}/${mes}/${anio}, ${horas}:${minutos}:${segundos}`;
  };

  // Preparar los datos para exportar a CSV
  const csvData = [
    ...pedidosFiltrados.map((pedido) => ({
      Fecha: formatFecha(pedido.fecha_pedido),
      Proveedor: pedido.proveedor_nombre,
      "Email Usuario": pedido.usuario_email,
      Total: `$${parseFloat(pedido.total).toFixed(2)}`,
    })),
    // Fila adicional para el total
    {
      Fecha: "",
      Proveedor: "",
      "Email Usuario": "",
      Total: `$${totalPedidosFiltrados.toFixed(2)}`,
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

        {/* Contenedor del botón CSV con margen arriba para bajarlo */}
        <Box sx={{ marginTop: "16px" }}>
          <CSVLink
            data={csvData}
            filename={"pedidos.csv"}
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              backgroundColor: "#008f39",
              color: "white",
              borderRadius: "4px",
              maxHeight: "40px",
              display: "flex",
              alignItems: "center",
              gap: "8px", // Espacio entre el ícono y el texto
            }}
          >
            <img
              src={iconCSV} // Ruta de la imagen
              alt="Exportar"
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          </CSVLink>
        </Box>
      </Box>
      <Sheet sx={{ width: "100%", overflow: "auto", borderRadius: "sm" }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th></th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Email Usuario</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <React.Fragment key={pedido.pedido_id}>
                <tr>
                  <td>
                    <IconButton onClick={() => handleExpand(pedido.pedido_id)}>
                      {expandedRow === pedido.pedido_id ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </td>
                  <td>{formatFecha(pedido.fecha_pedido)}</td>
                  <td>{pedido.proveedor_nombre}</td>
                  <td>{pedido.usuario_email}</td>
                  <td>${parseFloat(pedido.total).toFixed(2)}</td>
                  <td>
                    <Dropdown>
                      <MenuButton
                        slots={{ root: IconButton }}
                        slotProps={{
                          root: { variant: "plain", color: "neutral" },
                        }}
                      >
                        <MoreHorizRoundedIcon />
                      </MenuButton>
                      <Menu>
                        <MenuItem
                          color="danger"
                          onClick={() => deletePedido(pedido.pedido_id)}
                        >
                          Eliminar
                        </MenuItem>
                      </Menu>
                    </Dropdown>
                  </td>
                </tr>

                {expandedRow === pedido.pedido_id && orderDetails && (
                  <tr>
                    <td colSpan={6}>
                      <Table>
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.detalles.map((detail: any) => (
                            <tr key={detail.detalle_id}>
                              <td>{detail.producto_nombre}</td>
                              <td>{detail.cantidad}</td>
                              <td>${detail.precio_unitario}</td>
                              <td>${detail.subtotal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={4}
                style={{ textAlign: "right", fontWeight: "bold" }}
              >
                Total:
              </td>
              <td style={{ fontWeight: "bold" }}>
                ${totalPedidosFiltrados.toFixed(2)}
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
