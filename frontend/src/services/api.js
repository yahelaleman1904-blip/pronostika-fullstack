import http, { getErrorMessage } from './http';

export const authApi = {
  async login(email, password) {
    try {
      const { data } = await http.post('/auth/login', { email, password });
      localStorage.setItem('pronostika_token', data.token);
      localStorage.setItem('pronostika_active_user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Credenciales inválidas.'));
    }
  },

  async register(payload) {
    try {
      const { data } = await http.post('/auth/register', payload);
      localStorage.setItem('pronostika_token', data.token);
      localStorage.setItem('pronostika_active_user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo completar el registro.'));
    }
  },

  async logout() {
    try {
      await http.post('/auth/logout');
    } catch {
      // Aunque falle la red, limpiamos la sesión local
    } finally {
      localStorage.removeItem('pronostika_token');
      localStorage.removeItem('pronostika_active_user');
    }
  },

  async recuperarPassword(email) {
    try {
      const { data } = await http.post('/auth/recuperar-password', { email });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al solicitar recuperación.'));
    }
  },
};

export const pronosticosApi = {
  async listar({ page = 0, size = 10, liga = '', search = '' } = {}) {
    try {
      const params = { page, size };
      if (liga) params.liga = liga;
      if (search) params.search = search;
      const { data } = await http.get('/pronosticos', { params });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudieron cargar los pronósticos.'));
    }
  },

  async crear(payload) {
    try {
      const { data } = await http.post('/pronosticos', payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo crear el pronóstico.'));
    }
  },

  async actualizar(id, payload) {
    try {
      const { data } = await http.put(`/pronosticos/${id}`, payload);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo actualizar el pronóstico.'));
    }
  },

  async eliminar(id) {
    try {
      await http.delete(`/pronosticos/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo eliminar el pronóstico.'));
    }
  },
};