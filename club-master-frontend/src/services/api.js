import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('club_master_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let useMock = true;

export function setUseMock(value) {
  useMock = value;
}

function mockPath(path) {
  const map = {
    '/auth/login': '/mock/auth/login',
    '/auth/register': '/mock/auth/register',
    '/auth/guest': '/mock/auth/guest',
    '/productos/categorias': '/mock/categorias',
    '/productos': '/mock/productos',
    '/mesas': '/mock/mesas',
    '/pedidos/estados': '/mock/estados-pedido',
    '/pedidos/staff': '/mock/pedidos/staff',
    '/pagos/metodos': '/mock/metodos-pago',
    '/admin/dashboard': '/mock/admin/dashboard',
  };
  return map[path] || null;
}

export async function apiGet(path, config = {}) {
  if (useMock) {
    const mp = mockPath(path);
    if (mp) {
      const res = await api.get(mp, config);
      return res.data;
    }
  }
  const res = await api.get(path, config);
  return res.data;
}

export async function apiPost(path, data) {
  if (useMock) {
    const mp = mockPath(path);
    if (mp) {
      const res = await api.post(mp, data);
      return res.data;
    }
  }
  const res = await api.post(path, data);
  return res.data;
}

export async function apiPatch(path, data) {
  if (useMock && path.startsWith('/pedidos/')) {
    const res = await api.patch(`/mock${path}`, data);
    return res.data;
  }
  const res = await api.patch(path, data);
  return res.data;
}

export async function getMesaByCodigo(codigo) {
  if (useMock) {
    const res = await api.get(`/mock/mesas/codigo/${codigo}`);
    return res.data;
  }
  const res = await api.get(`/mesas/codigo/${codigo}`);
  return res.data;
}

export async function getPromociones() {
  if (useMock) {
    const res = await api.get('/mock/promociones');
    return res.data;
  }
  const res = await api.get('/admin/promociones');
  return res.data;
}

export async function createPedido(data) {
  if (useMock) {
    const res = await api.post('/mock/pedidos', data);
    return res.data;
  }
  const res = await api.post('/pedidos', data);
  return res.data;
}

export default api;
