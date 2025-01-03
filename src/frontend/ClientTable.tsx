import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

interface ClientTableProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function fetchClientes(setClientes: (data: any[]) => void) {
  fetch('http://localhost:3000/api/clients')
    .then((response) => response.json())
    .then((data) => setClientes(data))
    .catch((error) => console.error('Error fetching clients:', error));
}

function updateCliente(
  clienteId: string | number, // Declara el tipo del ID
  clienteData: {
  identificacion: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  }, // Declara el tipo del cliente
  onSuccess: (updatedCliente: any) => void, // Tipo de la función de éxito
  onError: (error: any) => void // Tipo de la función de error
) {
  fetch(`http://localhost:3000/api/clients/${clienteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clienteData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al actualizar el cliente');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

function deleteCliente(clienteId: number, onSuccess: () => void, onError: (error: any) => void) {
  fetch(`http://localhost:3000/api/clients/${clienteId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al eliminar el cliente');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

async function createClient(clienteData: any, onSuccess: ((value: any) => any) | null | undefined, onError: ((reason: any) => PromiseLike<never>) | null | undefined) {
  fetch('http://localhost:3000/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clienteData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al crear el cliente');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

function notifySuccess(message: string) {
  toast.success(message, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

function notifyError(message: string) {
  toast.error(message, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

export default function ClientTable({ isCreateModalOpen, setIsCreateModalOpen }: ClientTableProps) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [editingCliente, setEditingCliente] = useState<any>(null); // Cliente en edición
  const [isModalOpen, setIsModalOpen] = useState(false); // Control del modal
  const [isFormValid, setIsFormValid] = useState(false); // Estado de validación del formulario
  const [newCliente, setNewCliente] = useState({
    identificacion: '',
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  const handleCreateChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setNewCliente((prev) => ({ ...prev, [name]: value }));
  };
  

  useEffect(() => {
    fetchClientes((data) => {
      // Ordenar los clientes por cliente_id de mayor a menor antes de establecer el estado
      const sortedClientes = data.sort((a: any, b: any) => b.cliente_id - a.cliente_id);
      setClientes(sortedClientes);
    });
  }, []);

  const handleDelete = (clienteId: number) => {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: 'center' }}>
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <Button
              color="danger"
              onClick={() => {
                deleteCliente(
                  clienteId,
                  () => {
                    setClientes((prevClientes) =>
                      prevClientes.filter((c) => c.cliente_id !== clienteId)
                    );
                    notifySuccess('Cliente eliminado exitosamente.');
                    closeToast(); // Cierra el toast
                  },
                  (error) => {
                    console.error('Error al eliminar el cliente:', error);
                    notifyError('No se pudo eliminar el cliente.');
                    closeToast(); // Cierra el toast
                  }
                );
              }}
            >
              Confirmar
            </Button>
            <Button onClick={closeToast}>Cancelar</Button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false, // No cerrar automáticamente
        closeOnClick: false, // No cerrar al hacer clic fuera
      }
    );
  };
  

  useEffect(() => {
    // Validar el formulario dinámicamente
    if (editingCliente) {
      const { nombre, email, telefono, direccion } = editingCliente;

      const emailRegex = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;

      const isValid =
        nombre && nombre.length <= 255 &&
        email && email.length <= 255 && emailRegex.test(email) &&
        telefono && telefono.length <= 10 && /^\d*$/.test(telefono) &&
        direccion && direccion.length <= 255;

      setIsFormValid(isValid);
    }
  }, [editingCliente]);

  const handleEditClick = (cliente: any) => {
    setEditingCliente(cliente); // Cargar datos del cliente
    setIsModalOpen(true); // Abrir modal
  };

  const handleModalClose = () => {
    setEditingCliente(null); // Limpiar cliente en edición
    setIsModalOpen(false); // Cerrar modal
  };

  const handleSave = () => {
    if (!editingCliente) return;

    const { cliente_id, ...clienteData } = editingCliente;

    updateCliente(
      cliente_id,
      clienteData,
      (updatedCliente) => {
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente.cliente_id === updatedCliente.client.cliente_id
              ? updatedCliente.client
              : cliente
          )
        );
        notifySuccess('Cliente actualizado exitosamente.');
        handleModalClose(); // Cierra el modal
      },
      (error) => {
        console.error('Error al actualizar el cliente:', error);
        notifyError('No se pudo actualizar el cliente.');
      }
    );
  };

  const handleCreateSave = () => {
    createClient(
      newCliente,
      (createdCliente) => {
        if (createdCliente && createdCliente.id) {
          setClientes((prev) => [createdCliente, ...prev]); // Añade solo si es válido
          notifySuccess('Cliente creado exitosamente.');
        } else {
          console.warn('La respuesta del cliente no es válida:', createdCliente);
          notifyError('No se pudo procesar la respuesta del cliente.');
        }
        setIsCreateModalOpen(false);
      },
      (error) => {
        console.error('Error al crear cliente:', error);
        notifyError('No se pudo crear el cliente.');
        return Promise.reject(error);
      }
    );
  };

  const filteredClientes = clientes.filter((cliente) =>
    cliente.cliente_id.toString().includes(searchTerm) ||
    cliente.identificacion.includes(searchTerm) ||
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <React.Fragment>
      {/* Barra de búsqueda */}
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Clientes</FormLabel>
          <Input
            placeholder="Buscar por ID, Documento, Nombre o Correo"
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
      </Box>

      {/* Tabla de clientes */}
      <Sheet sx={{ width: '100%', overflow: 'auto', borderRadius: 'sm' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center' }}>
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== filteredClientes.length
                  }
                  checked={selected.length === filteredClientes.length}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? filteredClientes.map((c) => c.cliente_id) : []
                    )
                  }
                />
              </th>
              <th style={{ width: 90 }}>Cliente ID</th>
              <th style={{ width: 120 }}>Nro Documento</th>
              <th style={{ width: 150 }}>Nombre</th>
              <th style={{ width: 250, wordBreak: 'break-word' }}>Correo</th>
              <th style={{ width: 130, textAlign: 'center' }}>Teléfono</th>
              <th style={{ width: 180 }}>Dirección</th>
              <th style={{ width: 100, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente.cliente_id}>
                <td style={{ textAlign: 'center' }}>
                  <Checkbox
                    size="sm"
                    checked={selected.includes(cliente.cliente_id)}
                    onChange={(e) => {
                      setSelected((ids) =>
                        e.target.checked
                          ? ids.concat(cliente.cliente_id)
                          : ids.filter((id) => id !== cliente.cliente_id)
                      );
                    }}
                  />
                </td>
                <td>{cliente.cliente_id}</td>
                <td>{cliente.identificacion}</td>
                <td>{cliente.nombre}</td>
                <td style={{ wordBreak: 'break-word' }}>{cliente.email}</td>
                <td style={{ textAlign: 'center' }}>{cliente.telefono}</td>
                <td>{cliente.direccion}</td>
                {/* Columna de Acciones */}
                <td style={{ textAlign: 'center' }}>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                    >
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                    <MenuItem onClick={() => handleEditClick(cliente)}>
                        Editar
                      </MenuItem>
                      {/* <MenuItem onClick={() => console.log('Actualizar', cliente.cliente_id)}>
                        Actualizar
                      </MenuItem> */}
                      <MenuItem
                        color="danger"
                        onClick={() => handleDelete(cliente.cliente_id)}
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

       {/* Modal de edición */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <ModalDialog>
          <Typography component="h2">Editar Cliente</Typography>
          {editingCliente && (
            <Box sx={{ mt: 2 }}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={editingCliente.nombre}
                  onChange={(e) => {
                    const nombre = e.target.value;
                    if (nombre.length <= 255) {
                      setEditingCliente({ ...editingCliente, nombre });
                    }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel sx={{ pt: 1 }}>Email</FormLabel>
                <Input
                  value={editingCliente.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    if (email.length <= 255) {
                      setEditingCliente({ ...editingCliente, email });
                    }
                  }}
                  onBlur={(e) => {
                    const email = e.target.value;
                    const emailRegex = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;
                    if (!emailRegex.test(email)) {
                      notifyError('Por favor, ingresa un correo válido.');
                    } else {
                      notifySuccess('Correo válido.');
                    }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel sx={{ pt: 1 }}>Teléfono</FormLabel>
                <Input
                  value={editingCliente.telefono}
                  onChange={(e) => {
                    const telefono = e.target.value;
                    if (/^\d*$/.test(telefono) && telefono.length <= 10) {
                      setEditingCliente({ ...editingCliente, telefono });
                    }
                    if (!/^\d*$/.test(telefono)) {
                      notifyError('Solo se permiten números en el teléfono.');
                    }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel sx={{ pt: 1 }}>Dirección</FormLabel>
                <Input
                  value={editingCliente.direccion}
                  onChange={(e) => {
                    const direccion = e.target.value;
                    if (direccion.length <= 255) {
                      setEditingCliente({ ...editingCliente, direccion });
                    }
                  }}
                />
              </FormControl>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button color="danger" onClick={handleModalClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!isFormValid}>
                  Guardar
                </Button>
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>


      {/* Modal de creacion */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalDialog>
          <Typography component="h2">Añadir Nuevo Cliente</Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl>
              <FormLabel>Identificación</FormLabel>
              <Input
                name="identificacion"
                value={newCliente.identificacion}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input name="nombre" value={newCliente.nombre} onChange={handleCreateChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Dirección</FormLabel>
              <Input name="direccion" value={newCliente.direccion} onChange={handleCreateChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Input name="telefono" value={newCliente.telefono} onChange={handleCreateChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input name="email" value={newCliente.email} onChange={handleCreateChange} />
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button color="danger" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSave}>
                Guardar
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
        <Button size="sm" startDecorator={<KeyboardArrowLeftIcon />}>
          Anterior
        </Button>
        <Button size="sm" endDecorator={<KeyboardArrowRightIcon />}>
          Siguiente
        </Button>
      </Box>
      <ToastContainer />
    </React.Fragment>
  );
}
