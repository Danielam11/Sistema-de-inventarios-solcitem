import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Order {
  id: number;
  fechaPedido: string;
  proveedorId: string;
  usuarioId: string;
  total: number;
  subtotal: number;
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState<Order>({
    id: 0,
    fechaPedido: '',
    proveedorId: '',
    usuarioId: '',
    total: 0,
    subtotal: 0,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('http://localhost:3000/api/orders')
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => toast.error('Error al cargar pedidos.'));
  };

  const handleDelete = (orderId: number) => {
    fetch(`http://localhost:3000/api/orders/${orderId}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) throw new Error('Error al eliminar el pedido');
        toast.success('Pedido eliminado.');
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      })
      .catch((error) => toast.error('Error al eliminar el pedido.'));
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingOrder) return;

    fetch(`http://localhost:3000/api/orders/${editingOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingOrder),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Error al actualizar el pedido');
        return response.json();
      })
      .then((updatedOrder) => {
        setOrders((prev) =>
          prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
        );
        toast.success('Pedido actualizado.');
        setIsModalOpen(false);
      })
      .catch(() => toast.error('Error al actualizar el pedido.'));
  };

  const handleCreateOrder = () => {
    fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Error al crear el pedido');
        return response.json();
      })
      .then((createdOrder) => {
        setOrders((prev) => [createdOrder, ...prev]);
        toast.success('Pedido creado.');
      })
      .catch(() => toast.error('Error al crear el pedido.'));
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm) ||
      order.proveedorId.includes(searchTerm) ||
      order.usuarioId.includes(searchTerm)
  );

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Pedidos</FormLabel>
          <Input
            placeholder="Buscar por ID, Proveedor o Usuario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
      </Box>

      <Sheet sx={{ width: '100%', overflow: 'auto', borderRadius: 'sm' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.fechaPedido}</td>
                <td>{order.proveedorId}</td>
                <td>{order.usuarioId}</td>
                <td>{order.total}</td>
                <td>{order.subtotal}</td>
                <td>
                  <Button size="sm" onClick={() => handleEditClick(order)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(order.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalDialog>
          <Typography component="h2">Editar Pedido</Typography>
          {editingOrder && (
            <Box sx={{ mt: 2 }}>
              <FormControl>
                <FormLabel>Fecha Pedido</FormLabel>
                <Input
                  value={editingOrder.fechaPedido}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, fechaPedido: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Proveedor ID</FormLabel>
                <Input
                  value={editingOrder.proveedorId}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, proveedorId: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Usuario ID</FormLabel>
                <Input
                  value={editingOrder.usuarioId}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, usuarioId: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Total</FormLabel>
                <Input
                  value={editingOrder.total}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, total: +e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Subtotal</FormLabel>
                <Input
                  value={editingOrder.subtotal}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, subtotal: +e.target.value })
                  }
                />
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>

      <ToastContainer />
    </React.Fragment>
  );
}
