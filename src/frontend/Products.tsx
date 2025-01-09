import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import IconButton from '@mui/joy/IconButton';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function fetchData(endpoint: string, setData: (data: any) => void) {
  fetch(`http://localhost:3000/api/${endpoint}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error fetching ${endpoint}`);
      }
      return response.json();
    })
    .then(setData)
    .catch((error) => console.error(error));
}

function createProducto(productoData: any, onSuccess: (data: any) => void, onError: (error: any) => void) {
  fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productoData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

function updateProducto(productoId: string, productoData: any, onSuccess: (data: any) => void, onError: (error: any) => void) {
  fetch(`http://localhost:3000/api/products/${productoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productoData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

interface Producto {
  producto_id: string;
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  cantidad: number;
  marca_id: string;
  modelo_id: string;
  categoria_id: string;
  marca_nombre?: string;
  modelo_nombre?: string;
  categoria_nombre?: string;
}

interface DeleteProductoResponse {
  message: string;
}

function deleteProducto(
  productoId: string,
  onSuccess: (data: DeleteProductoResponse) => void,
  onError: (error: any) => void
) {
  fetch(`http://localhost:3000/api/products/${productoId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

export default function ProductTable() {
  const [productos, setProductos] = useState<Producto[]>([]);
  interface Marca {
    marca_id: string;
    nombre: string;
  }
  
  const [marcas, setMarcas] = useState<Marca[]>([]);
  interface Modelo {
    modelo_id: string;
    nombre: string;
  }

  const [modelos, setModelos] = useState<Modelo[]>([]);
  interface Categoria {
    categoria_id: string;
    nombre: string;
  }

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [newProducto, setNewProducto] = useState<Producto>({
    producto_id: '',
    nombre: '',
    descripcion: '',
    precio_compra: 0,
    precio_venta: 0,
    cantidad: 0,
    marca_id: '',
    modelo_id: '',
    categoria_id: '',
  });

  useEffect(() => {
    fetchData('products', setProductos);
    fetchData('brands', setMarcas);
    fetchData('models', setModelos);
    fetchData('categories', setCategorias);
  }, []);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingProducto((prev: Producto | null) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleCreateSave = () => {
    createProducto(
      newProducto,
      (createdProducto) => {
        setProductos((prev: Producto[]) => [createdProducto, ...prev]);
        toast.success('Producto creado exitosamente.');
        setIsCreateModalOpen(false);
        setNewProducto({
          producto_id: '',
          nombre: '',
          descripcion: '',
          precio_compra: 0,
          precio_venta: 0,
          cantidad: 0,
          marca_id: '',
          modelo_id: '',
          categoria_id: '',
        });
      },
      (error) => {
        console.error('Error al crear producto:', error);
        toast.error('No se pudo crear el producto.');
      }
    );
  };

  const handleEditSave = () => {
    updateProducto(
      editingProducto!.producto_id,
      editingProducto,
      (updatedProducto) => {
        setProductos((prev) =>
          prev.map((producto) =>
            producto.producto_id === updatedProducto.producto_id
              ? updatedProducto
              : producto
          )
        );
        toast.success('Producto actualizado exitosamente.');
        setIsEditModalOpen(false);
        setEditingProducto(null);
      },
      (error) => {
        console.error('Error al actualizar producto:', error);
        toast.error('No se pudo actualizar el producto.');
      }
    );
  };

  const handleDelete = (productoId: string) => {
    deleteProducto(
      productoId,
      () => {
        setProductos((prev: Producto[]) => prev.filter((producto) => producto.producto_id !== productoId));
        toast.success('Producto eliminado exitosamente.');
      },
      (error) => {
        console.error('Error al eliminar producto:', error);
        toast.error('No se pudo eliminar el producto.');
      }
    );
  };

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Productos</FormLabel>
          <Input
            placeholder="Buscar por nombre o descripción"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
        <Button onClick={() => setIsCreateModalOpen(true)}>Añadir Producto</Button>
      </Box>

      <Sheet sx={{ width: '100%', overflow: 'auto', borderRadius: 'sm' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Cantidad</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map((producto) => (
              <tr key={producto.producto_id}>
                <td>{producto.nombre}</td>
                <td>{producto.descripcion}</td>
                <td>{producto.precio_compra}</td>
                <td>{producto.precio_venta}</td>
                <td>{producto.cantidad}</td>
                <td>{producto.marca_nombre}</td>
                <td>{producto.modelo_nombre}</td>
                <td>{producto.categoria_nombre}</td>
                <td>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                    >
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                      <MenuItem
                        onClick={() => {
                          setEditingProducto(producto);
                          setIsEditModalOpen(true);
                        }}
                      >
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

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalDialog>
          <Typography component="h2">Añadir Nuevo Producto</Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input name="nombre" value={newProducto.nombre} onChange={handleCreateChange} />
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
                value={newProducto.marca_id}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({ ...prev, marca_id: value || '' }))
                }
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
                value={newProducto.modelo_id}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({ ...prev, modelo_id: value || '' }))
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
                value={newProducto.categoria_id}
                onChange={(e, value) =>
                  setNewProducto((prev) => ({ ...prev, categoria_id: value || '' }))
                }
              >
                {categorias.map((categoria) => (
                  <Option key={categoria.categoria_id} value={categoria.categoria_id}>
                    {categoria.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button color="danger" onClick={() => setIsCreateModalOpen(false)}>
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
                />
              </FormControl>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Select
                  name="marca_id"
                  value={editingProducto.marca_id}
                  onChange={(e, value) =>
                    setEditingProducto((prev) => (prev ? { ...prev, marca_id: value || '' } : null))
                  }
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
                  value={editingProducto.modelo_id}
                  onChange={(e, value) =>
                    setEditingProducto((prev) => (prev ? { ...prev, modelo_id: value || '' } : null))
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
                  value={editingProducto.categoria_id}
                  onChange={(e, value) =>
                    setEditingProducto((prev) => (prev ? { ...prev, categoria_id: value || '' } : null))
                  }
                >
                  {categorias.map((categoria) => (
                    <Option key={categoria.categoria_id} value={categoria.categoria_id}>
                      {categoria.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button color="danger" onClick={() => setIsEditModalOpen(false)}>
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
