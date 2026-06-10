const BASE = process.env.API_URL || 'http://127.0.0.1:3001/api';

async function req(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function ok(label, r) {
  const pass = r.status >= 200 && r.status < 300;
  console.log(`${pass ? '✓' : '✗'} ${label} → ${r.status}`, pass ? '' : JSON.stringify(r.data));
  return pass;
}

async function run() {
  console.log('=== Simulación CLUB MASTER ===\n');

  let r = await req('POST', '/auth/login', { body: { email: 'staff@clubmaster.com', password: 'staff123' } });
  if (!ok('Staff login', r)) return;
  const staffToken = r.data.token;

  r = await req('GET', '/pedidos/pendientes-aprobacion', { token: staffToken });
  ok('Listar pendientes aprobación', r);
  const pendienteId = r.data?.[0]?.id;

  if (pendienteId) {
    r = await req('PATCH', `/pedidos/${pendienteId}/aprobar`, { token: staffToken });
    ok(`Aprobar pedido #${pendienteId}`, r);
  }

  r = await req('GET', '/pedidos/staff?filtro=activos', { token: staffToken });
  ok('Listar pedidos staff activos', r);
  const pedidoActivo = r.data?.find((p) => p.estado === 'recibido' || p.estado === 'en_preparacion');

  if (pedidoActivo) {
    r = await req('PATCH', `/pedidos/${pedidoActivo.id}/estado`, { token: staffToken, body: { estado: 'listo' } });
    ok(`Actualizar pedido #${pedidoActivo.id} a listo`, r);
  }

  r = await req('GET', '/mesas/sesiones', { token: staffToken });
  ok('Listar sesiones mesa', r);
  const sesionId = r.data?.[0]?.id;

  if (sesionId) {
    r = await req('PATCH', `/mesas/sesiones/${sesionId}/cerrar`, { token: staffToken, body: {} });
    ok(`Cerrar sesión #${sesionId}`, r);
  }

  r = await req('GET', '/mesas', { token: staffToken });
  ok('Listar mesas tras cerrar sesión', r);
  const disponibles = Array.isArray(r.data) ? r.data.filter((m) => m.estado === 'disponible' && !m.sesion) : [];
  console.log(`  Mesas disponibles sin sesión: ${disponibles.length}`);

  r = await req('POST', '/auth/login', { body: { email: 'cliente@clubmaster.com', password: 'cliente123' } });
  ok('Cliente login', r);
  const clientToken = r.data.token;

  r = await req('POST', '/mesas/sesiones', { token: clientToken, body: { mesa_id: 10 } });
  ok('Cliente registra mesa 10', r);

  r = await req('POST', '/pedidos', {
    token: clientToken,
    body: { mesa_id: 10, items: [{ producto_id: 17, cantidad: 1 }], nombre_cliente: 'Test Sim' },
  });
  ok('Cliente crea pedido', r);
  const newPedidoId = r.data?.id;

  r = await req('GET', '/pedidos/pendientes-aprobacion', { token: staffToken });
  const found = r.data?.find((p) => p.id === newPedidoId);
  console.log(found ? `✓ Pedido #${newPedidoId} visible en aprobación` : `✗ Pedido #${newPedidoId} NO en aprobación`);

  if (newPedidoId) {
    r = await req('PATCH', `/pedidos/${newPedidoId}/rechazar`, { token: staffToken });
    ok(`Rechazar pedido #${newPedidoId}`, r);
  }

  console.log('\n=== Fin simulación ===');
}

run().catch((e) => {
  console.error('Error fatal:', e.message);
  process.exit(1);
});
