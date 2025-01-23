import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import IconButton from '@mui/joy/IconButton';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function fetchPedidos(setPedidos: (data: any[]) => void) {
  fetch('http://localhost:3000/api/orders')
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Procesar los datos si es necesario
      setPedidos(data);
    })
    .catch((error) => console.error('Error fetching orders:', error));
}

export default function OrderTable() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPedidos(setPedidos);
  }, []);

  const handleDelete = (pedidoId: number) => {
    fetch(`http://localhost:3000/api/orders/${pedidoId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al eliminar el pedido');
        }
        setPedidos((prev) => prev.filter((pedido) => pedido.pedido_id !== pedidoId));
        toast.success('Pedido eliminado exitosamente.');
      })
      .catch((error) => {
        console.error('Error al eliminar pedido:', error);
        toast.error('No se pudo eliminar el pedido.');
      });
  };

  const filteredPedidos = pedidos.filter(
    (pedido) =>
      pedido.fecha_pedido.includes(searchTerm) ||
      pedido.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.usuario_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString();
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Pedidos</FormLabel>
          <Input
            placeholder="Buscar por fecha, proveedor o email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
      </Box>

      <Sheet sx={{ width: '100%', overflow: 'auto', borderRadius: 'sm' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Email Usuario</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.pedido_id}>
                <td>{formatFecha(pedido.fecha_pedido)}</td>
                <td>{pedido.proveedor_nombre}</td>
                <td>{pedido.usuario_email}</td>
                <td>{pedido.total}</td>
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
                        color="danger"
                        onClick={() => handleDelete(pedido.pedido_id)}
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

      <ToastContainer />
    </React.Fragment>
  );
}
