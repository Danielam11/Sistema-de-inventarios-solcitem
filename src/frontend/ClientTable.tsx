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

function fetchClientes(setClientes: (data: any[]) => void) {
  fetch('http://localhost:3000/api/clients')
    .then((response) => response.json())
    .then((data) => setClientes(data))
    .catch((error) => console.error('Error fetching clients:', error));
}

export default function ClientTable() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<readonly string[]>([]);

  useEffect(() => {
    fetchClientes(setClientes);
  }, []);

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
                      <MenuItem onClick={() => console.log('Editar', cliente.cliente_id)}>
                        Editar
                      </MenuItem>
                      <MenuItem onClick={() => console.log('Actualizar', cliente.cliente_id)}>
                        Actualizar
                      </MenuItem>
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
