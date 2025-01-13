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
import SearchIcon from '@mui/icons-material/Search';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function fetchSales(setSales: (data: any[]) => void) {
  fetch('http://localhost:3000/api/sales')
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      setSales(data);
    })
    .catch((error) => console.error('Error fetching sales:', error));
}

function deleteSale(saleId: number, onSuccess: () => void, onError: (error: any) => void) {
  fetch(`http://localhost:3000/api/sales/${saleId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al eliminar la venta');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

export default function SalesTable() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSales(setSales);
  }, []);

  const handleDelete = (saleId: number) => {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: 'center' }}>
          <p>¿Estás seguro de que deseas eliminar esta venta?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => {
                deleteSale(
                  saleId,
                  () => {
                    setSales((prevSales) => prevSales.filter((s) => s.venta_id !== saleId));
                    toast.success('Venta eliminada exitosamente.');
                    closeToast();
                  },
                  (error) => {
                    console.error('Error al eliminar la venta:', error);
                    toast.error('No se pudo eliminar la venta.');
                    closeToast();
                  }
                );
              }}
            >
              Confirmar
            </button>
            <button onClick={closeToast}>Cancelar</button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
      }
    );
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.fecha_venta?.includes(searchTerm) ||
      sale.cliente_id?.toString().includes(searchTerm) ||
      sale.usuario_id?.toString().includes(searchTerm)
  );

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Ventas</FormLabel>
          <Input
            placeholder="Buscar por fecha, cliente o usuario"
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
      </Box>

      <Sheet sx={{ width: '100%', overflow: 'auto', borderRadius: 'sm' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th>Venta ID</th>
              <th>Fecha</th>
              <th>Cliente ID</th>
              <th>Usuario ID</th>
              <th>Total</th>
              <th>Subtotal</th>
              <th>Producto ID</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal Producto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {filteredSales.map((sale) => {
            // Formatea la fecha
            const formattedDate = new Date(sale.fecha_venta).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return (
              <tr key={sale.venta_id}>
                <td>{sale.venta_id}</td>
                <td>{formattedDate}</td>
                <td>{sale.cliente_nombre}</td>
                <td>{sale.usuario_id}</td>
                <td>{sale.total}</td>
                <td>{sale.subtotal}</td>
                <td>{sale.producto_id}</td>
                <td>{sale.cantidad_productos}</td>
                <td>{sale.precio_unitario}</td>
                <td>{sale.subtotal}</td>
                <td>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                    >
                      ...
                    </MenuButton>
                    <Menu>
                      <MenuItem
                        color="danger"
                        onClick={() => handleDelete(sale.venta_id)}
                      >
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </td>
              </tr>
            );
          })}
        </tbody>
        </Table>
      </Sheet>

      <ToastContainer />
    </React.Fragment>
  );
}
