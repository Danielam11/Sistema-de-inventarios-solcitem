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

function fetchUsuarios(setUsuarios: (data: any[]) => void) {
  fetch('http://localhost:3000/api/users')
    .then((response) => response.json())
    .then((data) => {
      console.log('Datos de usuarios (raw):', data);
      const validUsuarios = (data || []).filter(
        (usuario: { usuario_id: any; email: any; rol: any; }) => usuario && usuario.usuario_id && usuario.email && usuario.rol
      );
      console.log('Usuarios válidos:', validUsuarios);
      setUsuarios(validUsuarios);
    })
    .catch((error) => console.error('Error fetching usuarios:', error));
}

function updateUsuario(usuarioId: string, usuarioData: { email: string; contrasena: string; rol: string; }, onSuccess: ((value: any) => any) | null | undefined, onError: ((reason: any) => void) | null | undefined) {
  fetch(`http://localhost:3000/api/users/${usuarioId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuarioData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}

function deleteUsuario(usuarioId: any, onSuccess: ((value: any) => any) | null | undefined, onError: ((reason: any) => PromiseLike<never>) | null | undefined) {
  fetch(`http://localhost:3000/api/users/${usuarioId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }
      return response.json();
    })
    .then(onSuccess)
    .catch(onError);
}


export default function UserTable() {
  const [usuarios, setUsuarios] = useState<{ usuario_id: string; email: string; contrasena?: string; rol: string; }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [editingUsuario, setEditingUsuario] = useState({ usuario_id: '', email: '', contrasena: '', rol: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsuarios(setUsuarios);
  }, []);

  const handleEditClick = (usuario: { usuario_id: any; email: any; contrasena?: any; rol: any; }) => {
    if (!usuario) {
      console.warn('Usuario no válido para editar:', usuario);
      return;
    }
    setEditingUsuario({
      usuario_id: usuario.usuario_id || '',
      email: usuario.email || '',
      contrasena: usuario.contrasena || '',
      rol: usuario.rol || '',
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingUsuario({ usuario_id: '', email: '', contrasena: '', rol: '' });
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!editingUsuario || !editingUsuario.usuario_id) {
      console.warn('Usuario inválido para guardar:', editingUsuario);
      return;
    }

    const { usuario_id, ...usuarioData } = editingUsuario;

    updateUsuario(
      usuario_id,
      usuarioData,
      (updatedUsuario) => {
        console.log('Usuario actualizado:', updatedUsuario);
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.usuario_id === updatedUsuario.user.usuario_id
              ? updatedUsuario.user
              : usuario
          )
        );
        handleModalClose();
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        alert('No se pudo actualizar el usuario.');
      }
    );
  };

  const handleDelete = (usuarioId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    deleteUsuario(
      usuarioId,
      () => {
        console.log('Usuario eliminado:', usuarioId);
        setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.usuario_id !== usuarioId));
      },
      (error) => {
        console.error('Error al eliminar el usuario:', error);
        alert('No se pudo eliminar el usuario.');
        return Promise.reject(error);
      }
    );
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario &&
      (usuario.usuario_id.toString().includes(searchTerm) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.rol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 1.5, padding: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Buscar Usuarios</FormLabel>
          <Input
            placeholder="Buscar por ID, Email o Rol"
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
              <th style={{ width: 48, textAlign: 'center' }}>
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== filteredUsuarios.length
                  }
                  checked={selected.length === filteredUsuarios.length}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? filteredUsuarios.map((u) => u.usuario_id)
                        : []
                    )
                  }
                />
              </th>
              <th style={{ width: 90 }}>Usuario ID</th>
              <th style={{ width: 150 }}>Email</th>
              <th style={{ width: 150 }}>Rol</th>
              <th style={{ width: 100, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.usuario_id}>
                  <td style={{ textAlign: 'center' }}>
                    <Checkbox
                      size="sm"
                      checked={selected.includes(usuario.usuario_id)}
                      onChange={(e) => {
                        setSelected((ids) =>
                          e.target.checked
                            ? ids.concat(usuario.usuario_id)
                            : ids.filter((id) => id !== usuario.usuario_id)
                        );
                      }}
                    />
                  </td>
                  <td>{usuario.usuario_id}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Dropdown>
                      <MenuButton
                        slots={{ root: IconButton }}
                        slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                      >
                        <MoreHorizRoundedIcon />
                      </MenuButton>
                      <Menu>
                        <MenuItem onClick={() => handleEditClick(usuario)}>Editar</MenuItem>
                        <MenuItem
                          color="danger"
                          onClick={() => handleDelete(usuario.usuario_id)}
                        >
                          Eliminar
                        </MenuItem>
                      </Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>

      <Modal open={isModalOpen} onClose={handleModalClose}>
        <ModalDialog>
          <Typography component="h2">Editar Usuario</Typography>
          {editingUsuario && (
            <Box sx={{ mt: 2 }}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={editingUsuario.email}
                  onChange={(e) =>
                    setEditingUsuario({ ...editingUsuario, email: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  value={editingUsuario.contrasena || ''}
                  onChange={(e) =>
                    setEditingUsuario({ ...editingUsuario, contrasena: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rol</FormLabel>
                <Input
                  value={editingUsuario.rol}
                  onChange={(e) =>
                    setEditingUsuario({ ...editingUsuario, rol: e.target.value })
                  }
                />
              </FormControl>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleSave}>Guardar</Button>
                <Button color="danger" onClick={handleModalClose}>Cancelar</Button>
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}
