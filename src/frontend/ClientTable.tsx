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


export default function ClientTable() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [editingCliente, setEditingCliente] = useState<any>(null); // Cliente en edición
  const [isModalOpen, setIsModalOpen] = useState(false); // Control del modal

  useEffect(() => {
    fetchClientes(setClientes);
  }, []);

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
        handleModalClose(); // Cierra el modal
      },
      (error) => {
        console.error('Error al actualizar el cliente:', error);
        alert('No se pudo actualizar el cliente.');
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
                        onClick={() => console.log('Eliminar', cliente.cliente_id)}
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
                  onChange={(e) =>
                    setEditingCliente({ ...editingCliente, nombre: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={editingCliente.email}
                  onChange={(e) =>
                    setEditingCliente({ ...editingCliente, email: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={editingCliente.telefono}
                  onChange={(e) =>
                    setEditingCliente({ ...editingCliente, telefono: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input
                  value={editingCliente.direccion}
                  onChange={(e) =>
                    setEditingCliente({ ...editingCliente, direccion: e.target.value })
                  }
                />
              </FormControl>
              <Box sx={{ mt: 2 }}>
                <Button onClick={handleSave}>Guardar</Button>
                <Button onClick={handleModalClose}>Cancelar</Button>
              </Box>
            </Box>
          )}
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
    </React.Fragment>
  );
}
