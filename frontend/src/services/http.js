import axios from 'axios';

// Cliente Axios para el backend Spring Boot.
// La URL se puede cambiar con VITE_API_URL en frontend/.env (no se sube al repo).
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Busca el JWT guardado por el login (token directo o dentro del usuario activo).
export const getToken = () => {
  const direct = localStorage.getItem('pronostika_token');
  if (direct) return direct;
  try {
    const user = JSON.parse(localStorage.getItem('pronostika_active_user') || 'null');
    return user?.token || user?.accessToken || null;
  } catch {
    return null;
  }
};

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Convierte la respuesta de error del backend (ErrorResponseDTO) en un mensaje legible.
export const getErrorMessage = (error, fallback = 'Ocurrió un error inesperado.') => {
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
  }
  const { status, data } = error.response;
  if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (data?.campos) {
    const first = Object.values(data.campos)[0];
    if (first) return first;
  }
  return data?.mensaje || fallback;
};

export default http;
