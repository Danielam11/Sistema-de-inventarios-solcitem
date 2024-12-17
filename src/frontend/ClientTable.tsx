import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Link from '@mui/joy/Link';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

function fetchClientes(setClientes: (data: any[]) => void) {
  fetch('http://localhost:3000/api/clients') // URL del servicio
    .then((response) => response.json())
    .then((data) => setClientes(data))
    .catch((error) => console.error('Error fetching clients:', error));
}

export default function ClientTable() {
  const [clientes, setClientes] = useState<any[]>([]); // Estado para almacenar clientes
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el filtro de búsqueda
  const [selected, setSelected] = useState<readonly string[]>([]);

  useEffect(() => {
    fetchClientes(setClientes); // Recupera los clientes al montar el componente
  }, []);

  // Filtrar clientes según el término de búsqueda
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
            onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el término de búsqueda
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
