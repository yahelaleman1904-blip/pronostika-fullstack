import http, { getErrorMessage } from './http';

const mapPronosticoToMatch = (p) => {
  const local = p.equipoLocal || p.partido?.equipoLocal || '';
  const visitante = p.equipoVisitante || p.partido?.equipoVisitante || '';
  const vsString = Object.values(p).find(
    (v) => typeof v === 'string' && v.includes(' vs ')
  );

  const title =
    (typeof p.partido === 'string' && p.partido) ||
    p.partidoNombre ||
    p.nombrePartido ||
    p.encuentro ||
    p.titulo ||
    vsString ||
    (local && visitante ? `${local} vs ${visitante}` : `Partido #${p.partidoId || p.id}`);

  const category =
    p.liga || p.ligaNombre || p.partido?.liga?.nombre || p.category || 'General';

  return {
    id: p.id,
    partidoId: p.partidoId || p.partido?.id || 1,
    title,
    category,
    ganadorPrevisto: p.ganadorPrevisto || 'Pendiente',
    probabilidad: p.probabilidad ?? 50,
    estado: p.estado || 'Pendiente',
    fecha: p.fechaPartido || p.fecha || 'Próximamente',
  };
};

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
      // Limpia sesión local aunque falle la red
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

  async restablecerPassword(email, codigo, nuevaPassword) {
    try {
      const { data } = await http.post('/auth/restablecer-password', {
        email,
        codigo,
        nuevaPassword,
      });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo restablecer la contraseña.'));
    }
  },

  async enviarCodigoEmail(email, nombre) {
    try {
      const { data } = await http.post('/auth/email/enviar-codigo', { email, nombre });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo enviar el código a tu correo.'));
    }
  },

  async verificarCodigoEmail(email, codigo) {
    try {
      const { data } = await http.post('/auth/email/verificar-codigo', { email, codigo });
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Código incorrecto o expirado.'));
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

// Funciones usadas por DashboardPage.jsx conectadas al backend real
export const fetchMatches = async () => {
  const data = await pronosticosApi.listar({ page: 0, size: 50 });
  const items = Array.isArray(data) ? data : data?.content || [];
  return items.map(mapPronosticoToMatch);
};

export const createMatchApi = async (formData) => {
  const payload = {
    partidoId: Number(formData.partidoId) || 1,
    ganadorPrevisto: formData.ganadorPrevisto,
    probabilidad: Number(formData.probabilidad) || 50,
    estado: formData.estado || 'PENDIENTE',
  };
  const data = await pronosticosApi.crear(payload);
  return mapPronosticoToMatch(data);
};

export const updateMatchApi = async (id, formData) => {
  const payload = {
    partidoId: Number(formData.partidoId) || 1,
    ganadorPrevisto: formData.ganadorPrevisto,
    probabilidad: Number(formData.probabilidad) || 50,
    estado: formData.estado || 'PENDIENTE',
  };
  const data = await pronosticosApi.actualizar(id, payload);
  return mapPronosticoToMatch(data);
};

export const deleteMatchApi = async (id) => {
  return pronosticosApi.eliminar(id);
};

export const fetchRealMatchDetails = async (local, visitante, liga) => {
  const { data } = await http.get('/sports/match-details', {
    params: { local, visitante, liga },
  });
  return data;
};

export const fetchAiMatchAnalysis = async ({ local, visitante, liga, homeRecent, awayRecent }) => {
  const { data } = await http.post('/sports/ai-analysis', {
    local,
    visitante,
    liga,
    homeRecent,
    awayRecent,
  });
  return data;
};

export const guardarQuinielaApi = async (nombreJornada, selecciones) => {
  try {
    const { data } = await http.post('/quinielas', { nombreJornada, selecciones });
    return data; // { quiniela, smsEnviado, whatsappEnviado }
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo guardar la quiniela.'));
  }
};

export const listarQuinielasApi = async ({ page = 0, size = 10 } = {}) => {
  try {
    const { data } = await http.get('/quinielas', { params: { page, size } });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudieron cargar tus quinielas.'));
  }
};

export const obtenerQuinielaApi = async (id) => {
  try {
    const { data } = await http.get(`/quinielas/${id}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo obtener el detalle de la quiniela.'));
  }
};