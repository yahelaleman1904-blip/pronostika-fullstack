import http from './http';

// Módulo Admin: /api/admin/usuarios (requiere ROLE_ADMIN)

export const fetchAdminUsers = async ({ page = 0, size = 10, buscar = '', sort = 'id,asc' } = {}) => {
  const { data } = await http.get('/admin/usuarios', {
    params: { page, size, sort, buscar: buscar.trim() || undefined },
  });
  return data; // { contenido, pagina, tamanio, totalElementos, totalPaginas, primera, ultima }
};

export const fetchRoles = async () => {
  const { data } = await http.get('/admin/usuarios/roles');
  return data;
};

export const changeUserRole = async (id, rol) => {
  const { data } = await http.patch(`/admin/usuarios/${id}/rol`, { rol });
  return data;
};

export const deleteAdminUser = async (id) => {
  await http.delete(`/admin/usuarios/${id}`);
};
