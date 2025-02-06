import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SalesSummary() {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/sales");
      const data = await response.json();
      setSales(data);
      setFilteredSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const filterSalesByDate = () => {
    if (!fromDate || !toDate) {
      toast.error("Selecciona ambas fechas para filtrar");
      return;
    }

    const fromDateFormatted = new Date(fromDate).toISOString().split("T")[0];
    const toDateFormatted = new Date(toDate).toISOString().split("T")[0];

    const filtered = sales.filter((sale) => {
      const saleDateFormatted = new Date(sale.fecha_venta)
        .toISOString()
        .split("T")[0];
      return (
        saleDateFormatted >= fromDateFormatted &&
        saleDateFormatted <= toDateFormatted
      );
    });

    setFilteredSales(filtered);
  };

  const totalEfectivo = filteredSales
    .filter((sale) => sale.medio_pago === "EFECTIVO")
    .reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);

  const totalTransferencia = filteredSales
    .filter((sale) => sale.medio_pago === "TRANSFERENCIA")
    .reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);

  const totalGeneral = totalEfectivo + totalTransferencia;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>
        Resumen de Ventas
      </Typography>

      {/* Filtro de fechas */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl>
          <FormLabel>Desde *</FormLabel>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Hasta *</FormLabel>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </FormControl>
        <button
          onClick={filterSalesByDate}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            height: "35px",
            marginTop: "auto",
            alignSelf: "flex-start",
          }}
        >
          Filtrar
        </button>
      </Box>

      {/* Tabla de Totales */}
      <Sheet sx={{ width: "100%", overflow: "auto", borderRadius: "sm" }}>
        <Table>
          <thead>
            <tr>
              <th>Medio de Pago</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Efectivo</td>
              <td>${totalEfectivo.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Transferencia</td>
              <td>${totalTransferencia.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold" }}>Total General</td>
              <td style={{ fontWeight: "bold" }}>${totalGeneral.toFixed(2)}</td>
            </tr>
          </tbody>
        </Table>
      </Sheet>

      <ToastContainer />
    </Box>
  );
}
