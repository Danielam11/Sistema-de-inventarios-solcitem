import * as React from "react";
import { Link } from "react-router-dom";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import InventoryIcon from "@mui/icons-material/Inventory";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import PersonIcon from "@mui/icons-material/Person";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BrightnessAutoRoundedIcon from "@mui/icons-material/BrightnessAutoRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShieldIcon from "@mui/icons-material/Shield";
import logo from "./img/LOGO.png";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ColorSchemeToggle from "./ColorSchemeToggle.tsx";
import { closeSidebar } from "./utils.ts";
import { jwtDecode } from "jwt-decode";

const getUserDataFromToken = () => {
  const token = localStorage.getItem("token"); // Obtener token
  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    return {
      userId: decodedToken.userId,
      email: decodedToken.email,
      rol: decodedToken.rol, //
    };
  } catch (error) {
    console.error("Error al decodificar el token", error);
    return null;
  }
};

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: "grid",
            transition: "0.2s ease",
            "& > *": {
              overflow: "hidden",
            },
          },
          open ? { gridTemplateRows: "1fr" } : { gridTemplateRows: "0fr" },
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

export default function Sidebar() {
  const userData = getUserDataFromToken(); // Obtener datos del usuario
  const userEmail = userData ? userData.email : "Email no disponible";
  const userRole = userData ? userData.rol : "usuario"; // 🛑 Rol del usuario
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {/* Imagen (ajusta la ruta según tu proyecto) */}
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "4px", // Opcional para bordes redondeados
          }}
        />

        <Typography level="title-lg">Solticem</Typography>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>
      {/* <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Buscar"
      /> */}
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem sx={{ mb: 3 }}>
            <ListItemButton component={Link} to="productos">
              <InventoryIcon />
              <ListItemContent>
                <Typography level="title-sm">Productos</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem sx={{ mb: 3 }}>
            <ListItemButton component={Link} to="clientes">
              <PersonIcon />
              <ListItemContent>
                <Typography level="title-sm">Clientes</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem sx={{ mb: 3 }}>
            <ListItemButton component={Link} to="proveedores">
              <PeopleAltIcon />
              <ListItemContent>
                <Typography level="title-sm">Proveedores</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem sx={{ mb: 3 }}>
            <ListItemButton component={Link} to="crearventas">
              <ShoppingCartRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Ventas</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem sx={{ mb: 3 }}>
            <ListItemButton component={Link} to="crearpedidos">
              <LocalShippingIcon />
              <ListItemContent>
                <Typography level="title-sm">Pedidos</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <ReceiptIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Reportes</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? { transform: "rotate(180deg)" }
                        : { transform: "none" },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5, mb: 3 }}>
                <ListItem sx={{ mb: 0 }}>
                  <ListItemButton component={Link} to="ventas">
                    Ventas
                  </ListItemButton>
                </ListItem>
                <ListItem sx={{ mb: 0 }}>
                  <ListItemButton component={Link} to="pedidos">
                    Pedidos
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          <ListItem sx={{ mb: 3 }}>
            <ListItemButton component={Link} to="caja">
              <ShoppingCartRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Caja</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          {userRole === "administrador" && (
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <GroupRoundedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Usuarios</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? { transform: "rotate(180deg)" }
                          : { transform: "none" },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5, mb: 3 }}>
                  <ListItem sx={{ mb: 0 }}>
                    <ListItemButton component={Link} to="users">
                      Crear Nuevo Usuario
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <AccountCircleIcon
          sx={{
            color: "#2196f3", // Color personalizado
            fontSize: "30px", // Tamaño del ícono
            // Margen
            "&:hover": {
              // Efecto hover
              color: "#1976d2",
              transform: "scale(1.2)",
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Contenedor del usuario */}
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <Typography level="body-xs">{userEmail}</Typography>
          </Box>

          {/* Icono de Logout alineado a la derecha */}
          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            component={Link}
            to="/"
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </Sheet>
  );
}
