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

interface SupplierTableProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function fetchSuppliers(setSuppliers: (data: any[]) => void) {
  fetch('http://localhost:3000/api/suppliers')
    .then((response) => response.json())
    .then((data) => setSuppliers(data))
    .catch((error) => console.error('Error fetching suppliers:', error));
}

function updateSupplier(
  supplierId: string | number,
  supplierData: {
    identification: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  },
  onSuccess: (updatedSupplier: any) => void,
  onError: (error: any) => void
) {
  fetch(`http://localhost:3000/api/suppliers/${supplierId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al actualizar el proveedor');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

function deleteSupplier(
  supplierId: number,
  onSuccess: () => void, // No necesitamos la respuesta
  onError: (error: any) => void
) {
  fetch(`http://localhost:3000/api/suppliers/${supplierId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al eliminar el proveedor');
      }
      return; // No necesitamos procesar una respuesta JSON si la eliminación fue exitosa
    })
    .then(onSuccess) // Llama a la función de éxito directamente
    .catch(onError); // Maneja cualquier error
}


async function createSupplier(supplierData: any, onSuccess: ((value: any) => any) | null | undefined, onError: ((reason: any) => PromiseLike<never>) | null | undefined) {
  fetch('http://localhost:3000/api/suppliers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al crear el proveedor');
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

export default function SuppliersTable({ isCreateModalOpen, setIsCreateModalOpen }: SupplierTableProps) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    identification: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleCreateChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setNewSupplier((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchSuppliers((data) => {
      const sortedSuppliers = data
        .filter((supplier) => supplier.proveedor_id)
        .sort((a, b) => b.proveedor_id - a.proveedor_id);
      setSuppliers(sortedSuppliers);
    });
  }, []);

  const handleDelete = (supplierId: number) => {
    toast(
      ({ closeToast }) => (
        <div style={{ textAlign: 'center' }}>
          <p>¿Estás seguro de que deseas eliminar este proveedor?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <Button
              color="danger"
              onClick={() => {
                deleteSupplier(
                  supplierId,
                  () => {
                    setSuppliers((prevSuppliers) =>
                      prevSuppliers.filter((s) => s.proveedor_id !== supplierId)
                    );
                    notifySuccess('Proveedor eliminado exitosamente.');
                    closeToast();
                  },
                  (error) => {
                    console.error('Error al eliminar el proveedor:', error);
                    notifyError('No se pudo eliminar el proveedor.');
                    closeToast();
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
        autoClose: false,
        closeOnClick: false,
      }
    );
  };

  useEffect(() => {
    if (editingSupplier) {
      const { nombre, email, telefono, direccion } = editingSupplier;

      const emailRegex = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;

      const isValid =
        nombre && nombre.length <= 255 &&
        email && email.length <= 255 && emailRegex.test(email) &&
        telefono && telefono.length <= 10 && /^\d*$/.test(telefono) &&
        direccion && direccion.length <= 255;

      setIsFormValid(isValid);
    }
  }, [editingSupplier]);

  const handleEditClick = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingSupplier(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!editingSupplier) return;
  
    const { proveedor_id, nombre, direccion, telefono, email, identificacion } = editingSupplier;
  
    // Mapeo de nombres para enviar al backend
    const supplierData = {
      identification: identificacion,
      name: nombre,
      address: direccion,
      phone: telefono,
      email: email,
    };
  
    console.log('Actualizando proveedor:', { proveedor_id, supplierData });
  
    updateSupplier(
      proveedor_id,
      supplierData,
      (updatedSupplier) => {
        console.log('Respuesta del backend:', updatedSupplier);
  
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.proveedor_id === updatedSupplier.supplier.proveedor_id
              ? updatedSupplier.supplier
              : supplier
          )
        );
        notifySuccess('Proveedor actualizado exitosamente.');
        handleModalClose();
      },
      (error) => {
        console.error('Error al actualizar el proveedor:', error);
        notifyError('No se pudo actualizar el proveedor.');
      }
    );
  };

  const handleCreateSave = async () => {
    const { identification, name, address, phone, email } = newSupplier;
  
    // Validaciones antes de enviar al servicio
    if (!identification || !name || !address || !phone || !email) {
      notifyError('Todos los campos son obligatorios.');
      return;
    }
  
    const emailRegex = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;
    if (!emailRegex.test(email)) {
      notifyError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
  
    if (!/^\d{10}$/.test(phone)) {
      notifyError('El teléfono debe tener exactamente 10 dígitos.');
      return;
    }
  
    console.log('Datos enviados al servicio:', newSupplier); // Imprime los datos que se enviarán
  
    try {
      await createSupplier(
        newSupplier,
        (response) => {
          const { message, supplier } = response;
  
          if (supplier && supplier.proveedor_id) {
            setSuppliers((prev) => [supplier, ...prev]);
            notifySuccess(message || 'Proveedor creado exitosamente.');
          } else {
            console.warn('La respuesta del proveedor no es válida:', response);
            notifyError('No se pudo procesar la respuesta del proveedor.');
          }
          setIsCreateModalOpen(false);
        },
        (error) => {
          console.error('Error al crear el proveedor:', error);
          notifyError('No se pudo crear el proveedor. Inténtelo nuevamente.');
          throw error;
        }
      );
    } catch (error) {
      console.error('Error inesperado al crear el proveedor:', error);
      notifyError('Ocurrió un error inesperado. Por favor, revise la consola.');
    }
  };
  
  

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.proveedor_id?.toString().includes(searchTerm) ||
    supplier.identificacion?.includes(searchTerm) ||
    supplier.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <React.Fragment>
      {/* Barra de búsqueda */}
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Proveedores</FormLabel>
          <Input
            placeholder="Buscar por ID, Documento, Nombre o Correo"
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
      </Box>

      {/* Tabla de proveedores */}
      <Sheet sx={{ width: '100%', overflow: 'auto', borderRadius: 'sm' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center' }}>
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== filteredSuppliers.length
                  }
                  checked={selected.length === filteredSuppliers.length}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? filteredSuppliers.map((s) => s.proveedor_id) : []
                    )
                  }
                />
              </th>
              <th style={{ width: 90 }}>Proveedor ID</th>
              <th style={{ width: 120 }}>Nro Documento</th>
              <th style={{ width: 150 }}>Nombre</th>
              <th style={{ width: 250, wordBreak: 'break-word' }}>Correo</th>
              <th style={{ width: 130, textAlign: 'center' }}>Teléfono</th>
              <th style={{ width: 180 }}>Dirección</th>
              <th style={{ width: 100, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.proveedor_id || 'N/A'}>
                <td style={{ textAlign: 'center' }}>
                  <Checkbox
                    size="sm"
                    checked={selected.includes(supplier.proveedor_id)}
                    onChange={(e) => {
                      setSelected((ids) =>
                        e.target.checked
                          ? ids.concat(supplier.proveedor_id)
                          : ids.filter((id) => id !== supplier.proveedor_id)
                      );
                    }}
                  />
                </td>
                <td>{supplier.proveedor_id || 'N/A'}</td>
                <td>{supplier.identificacion || 'N/A'}</td>
                <td>{supplier.nombre || 'N/A'}</td>
                <td style={{ wordBreak: 'break-word' }}>{supplier.email || 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>{supplier.telefono || 'N/A'}</td>
                <td>{supplier.direccion || 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                    >
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                      <MenuItem onClick={() => handleEditClick(supplier)}>
                        Editar
                      </MenuItem>
                      <MenuItem
                        color="danger"
                        onClick={() => handleDelete(supplier.proveedor_id)}
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
          <Typography component="h2">Editar Proveedor</Typography>
          {editingSupplier && (
            <Box sx={{ mt: 2 }}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={editingSupplier.nombre}
                  onChange={(e) => {
                    const nombre = e.target.value;
                    if (nombre.length <= 255) {
                      setEditingSupplier({ ...editingSupplier, nombre });
                    }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel sx={{ pt: 1 }}>Email</FormLabel>
                <Input
                  value={editingSupplier.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    if (email.length <= 255) {
                      setEditingSupplier({ ...editingSupplier, email });
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
                  value={editingSupplier.telefono}
                  onChange={(e) => {
                    const telefono = e.target.value;
                    if (/^\d*$/.test(telefono) && telefono.length <= 10) {
                      setEditingSupplier({ ...editingSupplier, telefono });
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
                  value={editingSupplier.direccion}
                  onChange={(e) => {
                    const direccion = e.target.value;
                    if (direccion.length <= 255) {
                      setEditingSupplier({ ...editingSupplier, direccion });
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

      {/* Modal de creación */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalDialog>
          <Typography component="h2">Añadir Nuevo Proveedor</Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl>
              <FormLabel>Identificación</FormLabel>
              <Input
                name="identification"
                value={newSupplier.identification}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ pt: 1 }}>Nombre</FormLabel>
              <Input
                name="name"
                value={newSupplier.name}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ pt: 1 }}>Dirección</FormLabel>
              <Input
                name="address"
                value={newSupplier.address}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ pt: 1 }}>Teléfono</FormLabel>
              <Input
                name="phone"
                value={newSupplier.phone}
                onChange={handleCreateChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ pt: 1 }}>Email</FormLabel>
              <Input
                name="email"
                value={newSupplier.email}
                onChange={handleCreateChange}
              />
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
