import http from './http';

// Perfil del usuario autenticado: /api/perfil

export const fetchProfile = async () => {
  const { data } = await http.get('/perfil');
  return data;
};

export const updateProfile = async ({ telefono, avatarUrl }) => {
  const { data } = await http.put('/perfil', { telefono, avatarUrl });
  return data;
};
