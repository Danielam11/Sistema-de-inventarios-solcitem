import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import IconButton from "@mui/joy/IconButton";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface ProductsProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Producto {
  producto_id: string;
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  cantidad: number;
  marca_id?: string | null; // Opcional
  modelo_id?: string | null; // Opcional
  categoria_id?: string | null; // Opcional

  marca_nombre?: string;
  modelo_nombre?: string;
  categoria_nombre?: string;
  proveedores?: string[] | null; // Opcional
}

interface Proveedor {
  proveedor_id: string;
  nombre: string;
}

function fetchData(endpoint: string, setData: (data: any) => void) {
  fetch(`http://localhost:3000/api/${endpoint}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error fetching ${endpoint}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(`Data fetched from ${endpoint}:`, data);
      setData(data);
    })
    .catch((error) => console.error(error));
}

function createProducto(
  productoData: any,
  onSuccess: (data: any) => void,
  onError: (error: any) => void
) {
  fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productoData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
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

function updateProducto(
  productoId: string,
  productoData: any,
  onSuccess: (data: any) => void,
  onError: (error: any) => void
) {
  fetch(`http://localhost:3000/api/products/${productoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productoData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

function deleteProducto(
  productoId: string,
  onSuccess: (data: any) => void,
  onError: (error: any) => void
) {
  fetch(`http://localhost:3000/api/products/${productoId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

export default function Products({
  isCreateModalOpen,
  setIsCreateModalOpen,
}: ProductsProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [clickedColumn, setClickedColumn] = useState<number | null>(null);
  // Estados para los modales de Marca y Modelo
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);

  // Estados para los nuevos valores
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [nuevoModelo, setNuevoModelo] = useState("");

  const handleColumnClick = (columnIndex: number) => {
    setClickedColumn((prev) => (prev === columnIndex ? null : columnIndex));
  };

  useEffect(() => {
    fetchData("products", setProductos);
    fetchData("suppliers", setProveedores);
  }, []);

  const [marcas, setMarcas] = useState<{ marca_id: string; nombre: string }[]>(
    []
  );
  const [modelos, setModelos] = useState<
    { modelo_id: string; nombre: string }[]
  >([]);
  const [categorias, setCategorias] = useState<
    { categoria_id: string; nombre: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [newProducto, setNewProducto] = useState<Producto>({
    producto_id: "",
    nombre: "",
    descripcion: "",
    precio_compra: 0,
    precio_venta: 0,
    cantidad: 0,
    marca_id: "",
    modelo_id: "",
    categoria_id: "",
    proveedores: [],
  });

  useEffect(() => {
    fetchData("products", setProductos);
    fetchData("brands", setMarcas);
    fetchData("models", setModelos);
    fetchData("categories", setCategorias);
    fetchData("suppliers", setProveedores);
  }, []);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingProducto((prev: Producto | null) =>
      prev ? { ...prev, [name]: value } : null
    );
  };

  const handleSelectChange = (
    field: string,
    setField: React.Dispatch<React.SetStateAction<Producto | null>>
  ) => {
    return (e: any, value: string | null) => {
      setField((prev) => (prev ? { ...prev, [field]: value || "" } : null));
    };
  };
  // Función para actualizar marcas desde el backend
  const fetchMarcas = () => {
    fetch("http://localhost:3000/api/brands")
      .then((response) => response.json())
      .then((data) => setMarcas(data))
      .catch((error) => console.error("Error al actualizar marcas:", error));
  };

  // Función para actualizar modelos desde el backend
  const fetchModelos = () => {
    fetch("http://localhost:3000/api/models")
      .then((response) => response.json())
      .then((data) => setModelos(data))
      .catch((error) => console.error("Error al actualizar modelos:", error));
  };

  // Función para crear una nueva marca y actualizar la lista automáticamente
  const handleGuardarMarca = () => {
    const nuevaMarcaData = { nombre: nuevaMarca };

    fetch("http://localhost:3000/api/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaMarcaData),
    })
      .then((response) => response.json())
      .then((createdMarca) => {
        setNewProducto((prev) => ({
          ...prev,
          marca_id: createdMarca.marca_id,
        })); // Seleccionar la nueva marca
        fetchMarcas(); // Obtener la lista actualizada de marcas
        toast.success("Marca creada exitosamente.");
        setNuevaMarca(""); // Limpiar input
        setTimeout(() => setIsMarcaModalOpen(false), 500); // Cerrar modal con retraso para asegurar actualización
      })
      .catch((error) => {
        console.error("Error al crear la marca:", error);
        toast.error("No se pudo crear la marca.");
      });
  };

  // Función para crear un nuevo modelo y actualizar la lista automáticamente
  const handleGuardarModelo = () => {
    const nuevoModeloData = { nombre: nuevoModelo };

    fetch("http://localhost:3000/api/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoModeloData),
    })
      .then((response) => response.json())
      .then((createdModelo) => {
        setNewProducto((prev) => ({
          ...prev,
          modelo_id: createdModelo.modelo_id,
        })); // Seleccionar el nuevo modelo
        fetchModelos(); // Obtener la lista actualizada de modelos
        toast.success("Modelo creado exitosamente.");
        setNuevoModelo(""); // Limpiar input
        setTimeout(() => setIsModeloModalOpen(false), 500); // Cerrar modal con retraso
      })
      .catch((error) => {
        console.error("Error al crear el modelo:", error);
        toast.error("No se pudo crear el modelo.");
      });
  };
  const handleCreateSave = () => {
    const formattedProduct = {
      nombre: String(newProducto.nombre), // Asegurar que es string
      descripcion: String(newProducto.descripcion), // Asegurar string
      precio_compra: Number(newProducto.precio_compra), // Convertir a número
      precio_venta: Number(newProducto.precio_venta), // Convertir a número
      cantidad: Number(newProducto.cantidad), // Convertir a número
      marca_id: Number(newProducto.marca_id), // Convertir a número
      categoria_id: Number(newProducto.categoria_id), // Convertir a número
      modelo_id: Number(newProducto.modelo_id), // Convertir a número
      proveedor_ids: Array.isArray(newProducto.proveedores)
        ? newProducto.proveedores.map(Number) // Convertir a array de números
        : [],
    };

    if (
      !formattedProduct.nombre ||
      !formattedProduct.descripcion ||
      !formattedProduct.precio_venta ||
      formattedProduct.cantidad < 0
    ) {
      notifyError("Ingrese todos los campos obligatorios.");
      return;
    }

    // 🛠️ Imprime el producto corregido antes de enviarlo al backend
    console.log("✅ Enviando al backend:", formattedProduct);

    createProducto(
      formattedProduct,
      (createdProducto) => {
        setProductos((prev: Producto[]) => [createdProducto, ...prev]);
        toast.success("Producto creado exitosamente.");
        fetchData("products", setProductos);
        setIsCreateModalOpen(false);
        setNewProducto({
          producto_id: "",
          nombre: "",
          descripcion: "",
          precio_compra: 0,
          precio_venta: 0,
          cantidad: 0,
          marca_id: "",
          modelo_id: "",
          categoria_id: "",
          proveedores: [],
        });
      },
      (error) => {
        console.error("Error al crear producto:", error);
        toast.error("No se pudo crear el producto.");
      }
    );
  };

  const handleDelete = (productoId: string) => {
    deleteProducto(
      productoId,
      () => {
        setProductos((prev: Producto[]) =>
          prev.filter((producto) => producto.producto_id !== productoId)
        );
        toast.success("Producto eliminado exitosamente.");
      },
      (error) => {
        console.error("Error al eliminar producto:", error);
        toast.error("No se pudo eliminar el producto.");
      }
    );
  };
  const filteredProductos = productos.filter((producto) => {
    const nombre = producto.nombre ? producto.nombre.toLowerCase() : "";
    const descripcion = producto.descripcion
      ? producto.descripcion.toLowerCase()
      : "";

    return (
      nombre.includes(searchTerm.toLowerCase()) ||
      descripcion.includes(searchTerm.toLowerCase())
    );
  });

  const handleEditClick = (producto: Producto) => {
    // Buscar los IDs correspondientes a los nombres
    const marcaEncontrada = marcas.find(
      (m) => m.nombre === producto.marca_nombre
    );
    const modeloEncontrado = modelos.find(
      (m) => m.nombre === producto.modelo_nombre
    );
    const categoriaEncontrada = categorias.find(
      (c) => c.nombre === producto.categoria_nombre
    );

    // Convertir los nombres de proveedores en IDs
    const proveedoresEncontrados =
      producto.proveedores?.map((nombreProveedor) => {
        const proveedor = proveedores.find((p) => p.nombre === nombreProveedor);
        return proveedor ? proveedor.proveedor_id : "";
      }) || [];

    // Establecer el producto en edición con los IDs correctos
    setEditingProducto({
      ...producto,
      marca_id: marcaEncontrada ? marcaEncontrada.marca_id : "",
      modelo_id: modeloEncontrado ? modeloEncontrado.modelo_id : "",
      categoria_id: categoriaEncontrada ? categoriaEncontrada.categoria_id : "",
      proveedores: proveedoresEncontrados, // Aquí se asignan los IDs de los proveedores
    });

    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editingProducto) return;

    const formattedProduct = {
      nombre: String(editingProducto.nombre), // Asegurar que es string
      descripcion: String(editingProducto.descripcion), // Asegurar string
      precio_compra: Number(editingProducto.precio_compra), // Convertir a número
      precio_venta: Number(editingProducto.precio_venta), // Convertir a número
      cantidad: Number(editingProducto.cantidad), // Convertir a número
      marca_id: Number(editingProducto.marca_id), // Convertir a número
      categoria_id: Number(editingProducto.categoria_id), // Convertir a número
      modelo_id: Number(editingProducto.modelo_id), // Convertir a número
      proveedor_ids: Array.isArray(editingProducto.proveedores)
        ? editingProducto.proveedores.map(Number) // Convertir a array de números
        : [],
    };

    console.log("Producto seleccionado para editar:", editingProducto);
    if (
      !formattedProduct.nombre ||
      !formattedProduct.descripcion ||
      !formattedProduct.precio_compra ||
      !formattedProduct.precio_venta ||
      formattedProduct.cantidad < 0
    ) {
      notifyError("Ingrese todos los campos obligatorios.");
      return;
    }

    console.log("✅ Actualizando producto:", formattedProduct);

    updateProducto(
      editingProducto.producto_id,
      formattedProduct,
      (updatedProducto) => {
        setProductos((prev) =>
          prev.map((p) =>
            p.producto_id === updatedProducto.producto_id ? updatedProducto : p
          )
        );
        notifySuccess("Producto actualizado exitosamente.");
        fetchData("products", setProductos); // Recargar lista de productos
        setIsEditModalOpen(false);
        setEditingProducto(null);
      },
      (error) => {
        console.error("Error al actualizar producto:", error);
        toast.error("No se pudo actualizar el producto.");
      }
    );
  };

  return (
    <React.Fragment>
      {/* Formulario de creación de producto siempre visible */}
      <Box
        sx={{
          mt: 2,
          padding: 2,
          border: "1px solid #ddd",
          borderRadius: "sm",
        }}
      >
        <Typography component="h2" sx={{ fontSize: "1rem", marginBottom: 1 }}>
          Añadir Nuevo Producto
        </Typography>

        {/* 📌 Primera fila con 6 campos */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 1.5,
          }}
        >
          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Nombre *</FormLabel>
            <Input
              name="nombre"
              value={newProducto.nombre}
              onChange={handleCreateChange}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Descripción</FormLabel>
            <Input
              name="descripcion"
              value={newProducto.descripcion}
              onChange={handleCreateChange}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Precio Compra</FormLabel>
            <Input
              name="precio_compra"
              type="number"
              value={newProducto.precio_compra}
              onChange={handleCreateChange}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Precio Venta *</FormLabel>
            <Input
              name="precio_venta"
              type="number"
              value={newProducto.precio_venta}
              onChange={handleCreateChange}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Cantidad *</FormLabel>
            <Input
              name="cantidad"
              type="number"
              value={newProducto.cantidad}
              onChange={handleCreateChange}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Categoría *</FormLabel>
            <Select
              name="categoria_id"
              value={newProducto.categoria_id || ""}
              onChange={(e, value) =>
                setNewProducto((prev) => ({
                  ...prev,
                  categoria_id: value || "",
                }))
              }
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            >
              {categorias.map((categoria) => (
                <Option
                  key={categoria.categoria_id}
                  value={categoria.categoria_id}
                >
                  {categoria.nombre}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 📌 Segunda fila con 6 campos */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 1.5,
            mt: 2,
          }}
        >
          <FormControl sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <FormLabel sx={{ fontSize: "0.8rem" }}>Marca</FormLabel>
              <Select
                name="marca_id"
                value={newProducto.marca_id || ""}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({ ...prev, marca_id: value || "" }))
                }
                sx={{ fontSize: "0.8rem", padding: "4px" }}
              >
                {marcas.map((marca) => (
                  <Option key={marca.marca_id} value={marca.marca_id}>
                    {marca.nombre}
                  </Option>
                ))}
              </Select>
            </Box>
            <IconButton size="sm" onClick={() => setIsMarcaModalOpen(true)}>
              <AddCircleOutlineIcon />
            </IconButton>
          </FormControl>

          <FormControl sx={{ display: "flex", gap: 1 }}>
            <Box>
              <FormLabel sx={{ fontSize: "0.8rem" }}>Modelo</FormLabel>
              <Select
                name="modelo_id"
                value={newProducto.modelo_id || ""}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({
                    ...prev,
                    modelo_id: value || "",
                  }))
                }
                sx={{ fontSize: "0.8rem", padding: "4px" }}
              >
                {modelos.map((modelo) => (
                  <Option key={modelo.modelo_id} value={modelo.modelo_id}>
                    {modelo.nombre}
                  </Option>
                ))}
              </Select>
            </Box>
            <IconButton size="sm" onClick={() => setIsModeloModalOpen(true)}>
              <AddCircleOutlineIcon />
            </IconButton>
          </FormControl>

          <FormControl>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Proveedores</FormLabel>
            <Select
              multiple
              name="proveedores"
              value={newProducto.proveedores || []}
              onChange={(e, value) =>
                setNewProducto((prev) => ({
                  ...prev,
                  proveedores: value as string[],
                }))
              }
              sx={{ fontSize: "0.8rem", padding: "4px" }}
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

          {/* Espacios vacíos para completar 6 columnas en la segunda fila */}
          <Box></Box>
          <Box></Box>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "end",
              maxHeight: "40px",
            }}
          >
            <Button onClick={handleCreateSave} size="sm">
              Guardar
            </Button>
          </Box>
        </Box>
      </Box>
      <Modal open={isMarcaModalOpen} onClose={() => setIsMarcaModalOpen(false)}>
        <ModalDialog>
          <Typography component="h2" sx={{ fontSize: "1rem" }}>
            Crear Marca
          </Typography>
          <FormControl sx={{ marginTop: 2 }}>
            <FormLabel sx={{ fontSize: "0.8rem" }}>
              Nombre de la Marca
            </FormLabel>
            <Input
              name="nuevaMarca"
              value={nuevaMarca}
              onChange={(e) => setNuevaMarca(e.target.value)}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "end", marginTop: 2 }}>
            <Button onClick={handleGuardarMarca} size="sm">
              Guardar
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Modal para crear Modelo */}
      <Modal
        open={isModeloModalOpen}
        onClose={() => setIsModeloModalOpen(false)}
      >
        <ModalDialog>
          <Typography component="h2" sx={{ fontSize: "1rem" }}>
            Crear Modelo
          </Typography>
          <FormControl sx={{ marginTop: 2 }}>
            <FormLabel sx={{ fontSize: "0.8rem" }}>Nombre del Modelo</FormLabel>
            <Input
              name="nuevoModelo"
              value={nuevoModelo}
              onChange={(e) => setNuevoModelo(e.target.value)}
              sx={{ fontSize: "0.8rem", padding: "4px" }}
            />
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "end", marginTop: 2 }}>
            <Button onClick={handleGuardarModelo} size="sm">
              Guardar
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Box sx={{ display: "flex", gap: 0, padding: 0, marginTop: "10px" }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Productos</FormLabel>
          <Input
            placeholder="Buscar por nombre o descripción"
            value={searchTerm || ""} // 🔹 Evita que sea undefined
            onChange={(e) => setSearchTerm(e.target.value || "")} // 🔹 Maneja valores undefined
          />
        </FormControl>
      </Box>
      <Sheet sx={{ width: "100%", overflow: "auto", borderRadius: "sm" }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th style={{ width: "100px" }}>ID</th>
              <th
                style={{
                  width: "200px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Nombre
              </th>
              <th
                style={{
                  width: "250px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Descripción
              </th>
              <th style={{ width: "120px" }}>Precio Compra</th>
              <th style={{ width: "120px" }}>Precio Venta</th>
              <th style={{ width: "100px" }}>Cantidad</th>
              <th style={{ width: "150px" }}>Marca</th>
              <th style={{ width: "150px" }}>Modelo</th>
              <th style={{ width: "150px" }}>Categoría</th>
              <th
                style={{
                  width: "200px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Proveedores
              </th>
              <th style={{ width: "100px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos
              .filter((producto) => {
                const nombre = producto?.nombre?.toLowerCase() || "";
                const descripcion = producto?.descripcion?.toLowerCase() || "";
                const searchTermLower = searchTerm.toLowerCase();
                return (
                  nombre.includes(searchTermLower) ||
                  descripcion.includes(searchTermLower)
                );
              })
              .map((producto) => (
                <tr key={producto.producto_id}>
                  <td>{producto.producto_id}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion}</td>
                  <td>{producto.precio_compra}</td>
                  <td>{producto.precio_venta}</td>
                  <td>{producto.cantidad}</td>
                  <td>{producto.marca_nombre}</td>
                  <td>{producto.modelo_nombre}</td>
                  <td>{producto.categoria_nombre}</td>
                  <td>{producto.proveedores?.join(", ") || "N/A"}</td>
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
                        <MenuItem onClick={() => handleEditClick(producto)}>
                          Editar
                        </MenuItem>
                        <MenuItem
                          color="danger"
                          onClick={() => handleDelete(producto.producto_id)}
                        >
                          Eliminar
                        </MenuItem>
                      </Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Sheet>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ModalDialog>
          <Typography component="h2">Añadir Nuevo Producto</Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input
                name="nombre"
                value={newProducto.nombre}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Input
                name="descripcion"
                value={newProducto.descripcion}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Precio Compra</FormLabel>
              <Input
                name="precio_compra"
                type="number"
                value={newProducto.precio_compra}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Precio Venta</FormLabel>
              <Input
                name="precio_venta"
                type="number"
                value={newProducto.precio_venta}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Cantidad</FormLabel>
              <Input
                name="cantidad"
                type="number"
                value={newProducto.cantidad}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Marca</FormLabel>
              <Select
                name="marca_id"
                value={newProducto.marca_id || ""}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({ ...prev, marca_id: value || "" }))
                }
              >
                {marcas.map((marca) =>
                  marca.marca_id && marca.nombre ? (
                    <Option key={marca.marca_id} value={marca.marca_id}>
                      {marca.nombre}
                    </Option>
                  ) : null
                )}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <Select
                name="modelo_id"
                value={newProducto.modelo_id || ""}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({
                    ...prev,
                    modelo_id: value || "",
                  }))
                }
              >
                {modelos.map((modelo) => (
                  <Option key={modelo.modelo_id} value={modelo.modelo_id}>
                    {modelo.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Categoría</FormLabel>
              <Select
                name="categoria_id"
                value={newProducto.categoria_id || ""}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({
                    ...prev,
                    categoria_id: value || "",
                  }))
                }
              >
                {categorias.map((categoria) => (
                  <Option
                    key={categoria.categoria_id}
                    value={categoria.categoria_id}
                  >
                    {categoria.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Proveedores</FormLabel>
              <Select
                multiple
                name="proveedores"
                value={newProducto.proveedores || []}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({
                    ...prev,
                    proveedores: value as string[],
                  }))
                }
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
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                color="danger"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateSave}>Guardar</Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalDialog>
          <Typography component="h2">Editar Producto</Typography>
          {editingProducto && (
            <Box sx={{ mt: 2 }}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  name="nombre"
                  value={editingProducto.nombre}
                  onChange={handleEditChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Input
                  name="descripcion"
                  value={editingProducto.descripcion}
                  onChange={handleEditChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Precio Compra</FormLabel>
                <Input
                  name="precio_compra"
                  type="number"
                  value={editingProducto.precio_compra}
                  onChange={handleEditChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Precio Venta</FormLabel>
                <Input
                  name="precio_venta"
                  type="number"
                  value={editingProducto.precio_venta}
                  onChange={handleEditChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cantidad</FormLabel>
                <Input
                  name="cantidad"
                  type="number"
                  value={editingProducto.cantidad}
                  onChange={handleEditChange}
                  disabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Select
                  name="marca_id"
                  value={editingProducto?.marca_id || ""}
                  onChange={handleSelectChange("marca_id", setEditingProducto)}
                >
                  {marcas.map((marca) => (
                    <Option key={marca.marca_id} value={marca.marca_id}>
                      {marca.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Select
                  name="modelo_id"
                  value={editingProducto?.modelo_id || ""}
                  onChange={handleSelectChange("modelo_id", setEditingProducto)}
                >
                  {modelos.map((modelo) => (
                    <Option key={modelo.modelo_id} value={modelo.modelo_id}>
                      {modelo.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Select
                  name="categoria_id"
                  value={editingProducto?.categoria_id || ""}
                  onChange={handleSelectChange(
                    "categoria_id",
                    setEditingProducto
                  )}
                >
                  {categorias.map((categoria) => (
                    <Option
                      key={categoria.categoria_id}
                      value={categoria.categoria_id}
                    >
                      {categoria.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Proveedores</FormLabel>
                <Select
                  multiple
                  name="proveedores"
                  value={editingProducto.proveedores || []}
                  onChange={(e, value) =>
                    setEditingProducto((prev) =>
                      prev ? { ...prev, proveedores: value as string[] } : null
                    )
                  }
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
              <Box
                sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  color="danger"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleEditSave}>Guardar</Button>
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>

      <ToastContainer />
    </React.Fragment>
  );
}
