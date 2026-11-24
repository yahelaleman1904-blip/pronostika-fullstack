const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.mensaje || data?.message || 'Error en la petición al servidor';
    throw new Error(errorMsg);
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),
};

export const pronosticosApi = {
  listar: ({ page = 0, size = 10, liga = '', search = '' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (liga) params.append('liga', liga);
    if (search) params.append('search', search);
    return apiFetch(`/pronosticos?${params.toString()}`);
  },
};