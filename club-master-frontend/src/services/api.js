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

const MOCK_EXACT = {
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
  '/admin/productos': '/mock/admin/productos',
  '/admin/categorias': '/mock/admin/categorias',
  '/admin/inventario': '/mock/admin/inventario',
  '/admin/inventario/movimientos': '/mock/admin/inventario/movimientos',
  '/admin/promociones': '/mock/admin/promociones',
  '/admin/reservas': '/mock/admin/reservas',
  '/admin/usuarios': '/mock/admin/usuarios',
  '/admin/staff': '/mock/admin/staff',
  '/admin/pedidos': '/mock/admin/pedidos',
  '/admin/pagos': '/mock/admin/pagos',
  '/admin/reportes': '/mock/admin/reportes',
  '/admin/config': '/mock/admin/config',
  '/admin/mesas': '/mock/admin/mesas',
};

function resolveMock(path, method) {
  if (MOCK_EXACT[path]) return MOCK_EXACT[path];
  if (path.startsWith('/admin/')) return `/mock${path}`;
  if (path.startsWith('/pedidos')) return `/mock${path}`;
  if (path.startsWith('/mesas/')) return `/mock${path}`;
  return null;
}

export async function apiGet(path, config = {}) {
  if (useMock) {
    const mp = resolveMock(path, 'GET');
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
    const mp = resolveMock(path, 'POST');
    if (mp) {
      const res = await api.post(mp, data);
      return res.data;
    }
  }
  const res = await api.post(path, data);
  return res.data;
}

export async function apiPut(path, data) {
  if (useMock) {
    const mp = resolveMock(path, 'PUT');
    if (mp) {
      const res = await api.put(mp, data);
      return res.data;
    }
  }
  const res = await api.put(path, data);
  return res.data;
}

export async function apiPatch(path, data) {
  if (useMock) {
    const mp = resolveMock(path, 'PATCH');
    if (mp) {
      const res = await api.patch(mp, data);
      return res.data;
    }
  }
  const res = await api.patch(path, data);
  return res.data;
}

export async function apiDelete(path) {
  if (useMock) {
    const mp = resolveMock(path, 'DELETE');
    if (mp) {
      const res = await api.delete(mp);
      return res.data;
    }
  }
  const res = await api.delete(path);
  return res.data;
}

export async function staffGetPedidos(filtro = 'activos') {
  return apiGet(`/pedidos/staff?filtro=${filtro}`);
}

export async function staffAddItem(pedidoId, productoId, cantidad = 1) {
  return apiPost(`/pedidos/${pedidoId}/items`, { producto_id: productoId, cantidad });
}

export async function staffUpdateItemQty(pedidoId, productoId, cantidad) {
  return apiPatch(`/pedidos/${pedidoId}/items/${productoId}`, { cantidad });
}

export async function staffRemoveItem(pedidoId, productoId) {
  return apiDelete(`/pedidos/${pedidoId}/items/${productoId}`);
}

export async function staffCreatePedido(data) {
  return apiPost('/pedidos', data);
}

export async function staffUpdateEstado(pedidoId, estado) {
  return apiPatch(`/pedidos/${pedidoId}/estado`, { estado });
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
  return apiPost('/pedidos', data);
}

export async function getPedido(id) {
  return apiGet(`/pedidos/${id}`);
}

export async function aprobarPedido(id) {
  return apiPatch(`/pedidos/${id}/aprobar`);
}

export async function rechazarPedido(id) {
  return apiPatch(`/pedidos/${id}/rechazar`);
}

export default api;
