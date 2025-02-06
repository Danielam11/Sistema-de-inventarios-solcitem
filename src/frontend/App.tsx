import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import OrderTable from "./OrderTable";
import ClientTable from "./ClientTable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Users from "./Users";
import React, { useState } from "react";
import SuppliersTable from "./SupplierTable";
import Products from "./Products";
import Orders from "./Orders";
import Sales from "./Sales";
import CreateSaleForm from "./CreateSaleForm";
import CreateOrderForm from "./CreateOrderForm";
import Cash from "./Cash";
import { jwtDecode } from "jwt-decode";

const getUserDataFromToken = () => {
  const token = localStorage.getItem("token"); // Obtener el token guardado
  if (!token) {
    console.error("No hay token disponible");
    return null;
  }

  try {
    const decodedToken = jwtDecode(token); // Decodificar el token
    console.log("Token decodificado:", decodedToken);
    console.log("User ID:", decodedToken.userId);
    console.log("Email:", decodedToken.email);
    console.log("rol:", decodedToken.rol);

    return {
      rol: decodedToken.rol,
    };
  } catch (error) {
    console.error("Error al decodificar el token", error);
    return null;
  }
};

interface RouteDetails {
  [key: string]: {
    title: string;
    buttonText: string;
    breadcrumb: string[];
  };
}

function MainContent() {
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Obtener el rol del usuario
  const userData = getUserDataFromToken();
  const userRole = userData?.rol || "usuario"; // Si no hay rol, asumir "usuario"

  const routeDetails: RouteDetails = {
    "/dashboard/sales": {
      title: "Sales",
      buttonText: "Add new order",
      breadcrumb: ["Dashboard", "Orders"],
    },
    "/dashboard/clientes": {
      title: "Clientes",
      breadcrumb: ["Dashboard", "Clientes"],
    },
    "/dashboard/proveedores": {
      title: "Proveedores",
      buttonText: "Añadir nuevo Proveedor",
      breadcrumb: ["Dashboard", "Proveedores"],
    },
    "/dashboard/productos": {
      title: "Productos",
      breadcrumb: ["Dashboard", "productos"],
    },
    "/dashboard/pedidos": {
      title: "Pedidos",
      breadcrumb: ["Dashboard", "Reportes", "Pedidos"],
    },
    "/dashboard/ventas": {
      title: "Ventas",
      breadcrumb: ["Dashboard", "Reportes", "Ventas"],
    },
    "/dashboard/crearventas": {
      title: "Nueva Venta",
      breadcrumb: ["Dashboard", "Ventas"],
    },
    "/dashboard/crearpedidos": {
      title: "Nuevo Pedido",
      breadcrumb: ["Dashboard", "Pedidos"],
    },
    "/dashboard/caja": {
      title: "Caja",
      breadcrumb: ["Dashboard", "Caja"],
    },
  };

  // Solo añadir la ruta de usuarios si el rol es "administrador"
  if (userRole === "administrador") {
    routeDetails["/dashboard/users"] = {
      title: "Usuarios",
      buttonText: "Añadir nuevo Usuario",
      breadcrumb: ["Dashboard", "Usuarios"],
    };
  }

  const currentRoute = routeDetails[location.pathname] || {
    title: "Page",
    buttonText: "Action",
    breadcrumb: ["Dashboard"],
  };

  const handleOpenModal = () => {
    if (
      [
        "/dashboard/users",
        "/dashboard/clientes",
        "/dashboard/proveedores",
        "/dashboard/productos",
      ].includes(location.pathname)
    ) {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <Box
      component="main"
      className="MainContent"
      sx={{
        px: { xs: 2, md: 6 },
        pt: {
          xs: "calc(12px + var(--Header-height))",
          sm: "calc(12px + var(--Header-height))",
          md: 3,
        },
        pb: { xs: 2, sm: 2, md: 3 },
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100dvh",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Breadcrumbs
          size="sm"
          aria-label="breadcrumbs"
          separator={<ChevronRightRoundedIcon fontSize="small" />}
          sx={{ pl: 0 }}
        >
          <Link underline="none" color="neutral" href="/" aria-label="Home">
            <HomeRoundedIcon />
          </Link>
          {currentRoute.breadcrumb.map((crumb, index) => (
            <Link
              key={index}
              underline={
                index === currentRoute.breadcrumb.length - 1 ? "none" : "hover"
              }
              color={
                index === currentRoute.breadcrumb.length - 1
                  ? "primary"
                  : "neutral"
              }
              href={
                index === currentRoute.breadcrumb.length - 1
                  ? undefined
                  : "#some-link"
              }
              sx={{ fontSize: 12, fontWeight: 500 }}
            >
              {crumb}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: "flex",
          mb: 1,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "start", sm: "center" },
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography level="h2" component="h1">
          {currentRoute.title}
        </Typography>
        {currentRoute.buttonText && (
          <Button color="primary" size="sm" onClick={handleOpenModal}>
            {currentRoute.buttonText}
          </Button>
        )}
      </Box>

      <Routes>
        <Route index element={<Navigate to="productos" />} />
        <Route
          path="clientes"
          element={
            <ClientTable
              isCreateModalOpen={isCreateModalOpen}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />
          }
        />
        <Route path="sales" element={<OrderTable />} />
        {/* Proteger la ruta de usuarios */}
        {userRole === "administrador" ? (
          <Route
            path="users"
            element={
              <Users
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
              />
            }
          />
        ) : (
          <Route path="users" element={<CreateOrderForm />} />
        )}
        <Route
          path="proveedores"
          element={
            <SuppliersTable
              isCreateModalOpen={isCreateModalOpen}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />
          }
        />
        <Route
          path="productos"
          element={
            <Products
              isCreateModalOpen={isCreateModalOpen}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />
          }
        />
        <Route path="pedidos" element={<Orders />} />
        <Route path="ventas" element={<Sales />} />
        <Route path="crearventas" element={<CreateSaleForm />} />
        <Route path="crearpedidos" element={<CreateOrderForm />} />
        <Route path="caja" element={<Cash />} />
      </Routes>
    </Box>
  );
}

export default function App() {
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Header />
        <Sidebar />
        <MainContent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Box>
    </CssVarsProvider>
  );
}
