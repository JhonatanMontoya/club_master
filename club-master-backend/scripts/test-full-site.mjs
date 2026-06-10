/**
 * Prueba integral API — cliente, staff, admin
 * Uso: npm run test:site
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:3001/api';
const SUF = Date.now().toString(36);
const results = { pass: 0, fail: 0, errors: [] };

async function req(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

function test(name, r, expect = (s) => s >= 200 && s < 300) {
  const ok = expect(r.status);
  if (ok) { results.pass++; console.log(`✓ ${name}`); }
  else { results.fail++; results.errors.push({ name, status: r.status, data: r.data }); console.log(`✗ ${name} → ${r.status}`, JSON.stringify(r.data)?.slice(0, 120)); }
  return ok ? r.data : null;
}

const tokens = {};
const ids = {};

async function run() {
  console.log('=== PRUEBA INTEGRAL CLUB MASTER ===\n');

  // ─── Público ───
  test('Health', await req('GET', '/health'));
  test('Productos públicos', await req('GET', '/productos'));
  test('Categorías', await req('GET', '/productos/categorias'));
  test('Mesas públicas', await req('GET', '/mesas'));
  test('Promociones', await req('GET', '/promociones'));
  test('Métodos pago', await req('GET', '/pagos/metodos'));
  test('Config pública', await req('GET', '/config'));

  // ─── Auth ───
  let r = await req('POST', '/auth/login', { body: { email: 'admin@clubmaster.com', password: 'admin123' } });
  test('Login admin', r);
  tokens.admin = r.data?.token;

  r = await req('POST', '/auth/login', { body: { email: 'staff@clubmaster.com', password: 'staff123' } });
  test('Login staff', r);
  tokens.staff = r.data?.token;

  r = await req('POST', '/auth/login', { body: { email: 'cliente@clubmaster.com', password: 'cliente123' } });
  test('Login cliente', r);
  tokens.cliente = r.data?.token;

  r = await req('POST', '/auth/guest', { body: { nombre: 'Invitado Test' } });
  test('Guest login', r);
  tokens.guest = r.data?.token;

  r = await req('POST', '/auth/register', {
    body: {
      nombre: 'Registro Test', email: `reg.${SUF}@test.com`,
      password: 'test123', telefono: '3009999999',
    },
  });
  test('Registro cliente', r);

  r = await req('GET', '/auth/me', { token: tokens.admin });
  test('Auth me admin', r);

  // ─── Cliente flujo ───
  r = await req('POST', '/mesas/sesiones', { token: tokens.cliente, body: { mesa_id: 7 } });
  test('Cliente registra mesa', r);

  r = await req('GET', '/mesas/sesiones/mi', { token: tokens.cliente });
  test('Cliente mi sesión', r);

  r = await req('POST', '/pedidos', {
    token: tokens.cliente,
    body: { mesa_id: 7, items: [{ producto_id: 17, cantidad: 1 }], nombre_cliente: 'Cliente Demo' },
  });
  test('Cliente crea pedido', r);
  ids.pedidoCliente = r.data?.id;

  if (ids.pedidoCliente) {
    r = await req('GET', `/pedidos/${ids.pedidoCliente}`, { token: tokens.cliente });
    const p = test('Cliente consulta pedido', r);
    if (p && !p.detalle?.[0]?.nombre) {
      results.fail++; results.errors.push({ name: 'Pedido detalle tiene nombre' });
      console.log('✗ Pedido detalle sin campo nombre');
    } else if (p) { results.pass++; console.log('✓ Pedido detalle con nombre'); }
  }

  // ─── Staff flujo ───
  r = await req('GET', '/pedidos/pendientes-aprobacion', { token: tokens.staff });
  test('Staff pendientes aprobación', r);

  if (ids.pedidoCliente) {
    r = await req('PATCH', `/pedidos/${ids.pedidoCliente}/aprobar`, { token: tokens.staff, body: {} });
    test('Staff aprueba pedido', r);
  }

  r = await req('GET', '/pedidos/staff?filtro=activos', { token: tokens.staff });
  test('Staff lista activos', r);
  const pedidoStaff = r.data?.find((p) => p.estado === 'recibido') || r.data?.[0];
  ids.pedidoStaff = pedidoStaff?.id;

  if (ids.pedidoStaff) {
    r = await req('PATCH', `/pedidos/${ids.pedidoStaff}/estado`, { token: tokens.staff, body: { estado: 'en_preparacion' } });
    test('Staff cambia estado', r);
    r = await req('POST', `/pedidos/${ids.pedidoStaff}/items`, { token: tokens.staff, body: { producto_id: 28, cantidad: 1 } });
    test('Staff agrega item', r);
    r = await req('PATCH', `/pedidos/${ids.pedidoStaff}/items/28`, { token: tokens.staff, body: { cantidad: 2 } });
    test('Staff actualiza cantidad', r);
  }

  r = await req('GET', '/mesas/sesiones', { token: tokens.staff });
  test('Staff sesiones mesa', r);
  const sesionPendiente = r.data?.find((s) => s.estado === 'pendiente');
  if (sesionPendiente?.id) {
    r = await req('PATCH', `/mesas/sesiones/${sesionPendiente.id}/confirmar`, { token: tokens.staff, body: {} });
    test('Staff confirma sesión', r);
  } else {
    results.pass++;
    console.log('⊘ Staff confirma sesión (sin pendientes, OK)');
  }

  r = await req('POST', '/pedidos', {
    token: tokens.staff,
    body: { mesa_id: 6, items: [{ producto_id: 10, cantidad: 2 }], nombre_cliente: 'Staff Manual' },
  });
  test('Staff crea pedido', r);
  ids.pedidoItemTest = r.data?.id;
  if (ids.pedidoItemTest) {
    r = await req('DELETE', `/pedidos/${ids.pedidoItemTest}/items/10`, { token: tokens.staff });
    test('Staff elimina item', r);
  }

  r = await req('POST', '/pedidos', {
    token: tokens.cliente,
    body: { mesa_id: 7, items: [{ producto_id: 18, cantidad: 1 }], nombre_cliente: 'Para rechazar' },
  });
  ids.pedidoRechazar = r.data?.id;
  if (ids.pedidoRechazar) {
    r = await req('PATCH', `/pedidos/${ids.pedidoRechazar}/rechazar`, { token: tokens.staff, body: {} });
    test('Staff rechaza pedido', r);
  }

  // ─── Pago cliente ───
  if (ids.pedidoCliente) {
    r = await req('POST', '/pagos', {
      token: tokens.cliente,
      body: { pedido_id: ids.pedidoCliente, metodo_pago_id: 1, monto: 28000 },
    });
    test('Cliente registra pago', r);
    ids.pagoId = r.data?.id;
  }

  // ─── Admin lecturas ───
  const adminGets = [
    '/admin/dashboard', '/admin/config', '/admin/productos', '/admin/categorias',
    '/admin/inventario', '/admin/inventario/movimientos', '/admin/promociones',
    '/admin/reservas', '/admin/mesas', '/admin/usuarios', '/admin/staff',
    '/admin/pedidos?estado=activos', '/admin/pagos?resumen=1', '/admin/reportes?periodo=mes',
  ];
  for (const path of adminGets) {
    r = await req('GET', path, { token: tokens.admin });
    test(`Admin GET ${path.split('?')[0]}`, r);
  }

  // ─── Admin CRUD ───
  r = await req('POST', '/admin/categorias', {
    token: tokens.admin,
    body: { nombre: `Test Cat ${SUF}`, slug: `test-cat-${SUF}`, icono: 'test', orden: 99 },
  });
  test('Admin crea categoría', r);
  ids.categoria = r.data?.id;

  r = await req('POST', '/admin/productos', {
    token: tokens.admin,
    body: {
      categoria_id: ids.categoria || 1, nombre: 'Producto Test', descripcion: 'Test',
      precio: 9999, imagen_url: '/products/1.jpg', destacado: 0,
    },
  });
  test('Admin crea producto', r);
  ids.producto = r.data?.id;

  if (ids.producto) {
    r = await req('PUT', `/admin/productos/${ids.producto}`, {
      token: tokens.admin,
      body: {
        categoria_id: ids.categoria || 1, nombre: 'Producto Test Editado', descripcion: 'Test',
        precio: 10999, imagen_url: '/products/1.jpg', destacado: 0, activo: 1,
      },
    });
    test('Admin edita producto', r);
    r = await req('DELETE', `/admin/productos/${ids.producto}`, { token: tokens.admin });
    test('Admin desactiva producto', r);
  }

  if (ids.categoria) {
    r = await req('DELETE', `/admin/categorias/${ids.categoria}`, { token: tokens.admin });
    test('Admin desactiva categoría', r);
  }

  const mesaNumero = 9000 + (Date.now() % 900);
  r = await req('POST', '/admin/mesas', {
    token: tokens.admin,
    body: { numero: mesaNumero, capacidad: 4, zona: 'Test' },
  });
  test('Admin crea mesa', r);
  ids.mesa = r.data?.id;

  if (ids.mesa) {
    r = await req('PUT', `/admin/mesas/${ids.mesa}`, {
      token: tokens.admin,
      body: { numero: mesaNumero, capacidad: 6, zona: 'Test Edit', estado: 'disponible', codigo_qr: `MESA-${mesaNumero}` },
    });
    test('Admin edita mesa', r);
    r = await req('PATCH', `/admin/mesas/${ids.mesa}/estado`, { token: tokens.admin, body: { estado: 'mantenimiento' } });
    test('Admin cambia estado mesa', r);
    r = await req('DELETE', `/admin/mesas/${ids.mesa}`, { token: tokens.admin });
    test('Admin desactiva mesa', r);
  }

  r = await req('POST', '/admin/promociones', {
    token: tokens.admin,
    body: {
      titulo: 'Promo Test', descripcion: 'Test', tipo: 'descuento',
      descuento_porcentaje: 10, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31',
      imagen_url: '/products/1.jpg', producto_ids: [17],
    },
  });
  test('Admin crea promoción', r);
  ids.promo = r.data?.id;

  if (ids.promo) {
    r = await req('PUT', `/admin/promociones/${ids.promo}`, {
      token: tokens.admin,
      body: {
        titulo: 'Promo Test Edit', descripcion: 'Test', tipo: 'descuento',
        descuento_porcentaje: 15, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31',
        activa: 1, producto_ids: [17, 18],
      },
    });
    test('Admin edita promoción', r);
    r = await req('DELETE', `/admin/promociones/${ids.promo}`, { token: tokens.admin });
    test('Admin desactiva promoción', r);
  }

  const mesas = await req('GET', '/admin/mesas', { token: tokens.admin });
  const mesaReserva = mesas.data?.[0]?.id;
  if (mesaReserva) {
    r = await req('POST', '/admin/reservas', {
      token: tokens.admin,
      body: {
        mesa_id: mesaReserva, nombre_cliente: 'Reserva Test',
        fecha_reserva: '2026-12-25 20:00:00', personas: 4,
      },
    });
    test('Admin crea reserva', r);
    ids.reserva = r.data?.id;
    if (ids.reserva) {
      r = await req('PUT', `/admin/reservas/${ids.reserva}`, {
        token: tokens.admin,
        body: { estado: 'confirmada', nombre_cliente: 'Reserva Confirmada' },
      });
      test('Admin edita reserva', r);
      r = await req('DELETE', `/admin/reservas/${ids.reserva}`, { token: tokens.admin });
      test('Admin elimina reserva', r);
    }
  }

  r = await req('POST', '/admin/staff', {
    token: tokens.admin,
    body: { nombre: 'Staff Test', email: `staff.test.${Date.now()}@test.com`, telefono: '3001111111', subrol: 'mesero' },
  });
  test('Admin crea staff', r);
  ids.staffUser = r.data?.id;

  if (ids.staffUser) {
    r = await req('PUT', `/admin/staff/${ids.staffUser}`, {
      token: tokens.admin,
      body: { nombre: 'Staff Test Edit', subrol: 'bar', activo: 1 },
    });
    test('Admin edita staff', r);
  }

  r = await req('POST', '/admin/usuarios', {
    token: tokens.admin,
    body: {
      nombre: 'Usuario Test', email: `user.test.${Date.now()}@test.com`,
      telefono: '3002222222', password: 'test123', rol: 'cliente',
    },
  });
  test('Admin crea usuario', r);
  ids.usuario = r.data?.id;

  const inv = await req('GET', '/admin/inventario', { token: tokens.admin });
  const invId = inv.data?.[0]?.id;
  if (invId) {
    r = await req('PATCH', `/admin/inventario/${invId}`, { token: tokens.admin, body: { stock_minimo: 10 } });
    test('Admin patch inventario', r);
    r = await req('POST', '/admin/inventario/movimiento', {
      token: tokens.admin,
      body: { inventario_id: invId, tipo: 'entrada', cantidad: 5, motivo: 'Test' },
    });
    test('Admin movimiento inventario', r);
  }

  const pedidosAdmin = await req('GET', '/admin/pedidos?estado=activos', { token: tokens.admin });
  const pedAdmin = pedidosAdmin.data?.[0];
  if (pedAdmin) {
    r = await req('PATCH', `/admin/pedidos/${pedAdmin.id}/estado`, { token: tokens.admin, body: { estado: 'listo' } });
    test('Admin cambia estado pedido', r);
  }

  if (ids.pagoId) {
    r = await req('PATCH', `/admin/pagos/${ids.pagoId}`, { token: tokens.admin, body: { estado: 'completado' } });
    test('Admin confirma pago', r);
  }

  r = await req('PUT', '/admin/config', {
    token: tokens.admin,
    body: { negocio: 'CLUB MASTER', slogan: 'Test slogan' },
  });
  test('Admin guarda config', r);

  r = await req('GET', '/config');
  test('Config pública tras guardar', r);

  console.log(`\n=== RESUMEN: ${results.pass} OK, ${results.fail} FALLIDOS ===`);
  if (results.errors.length) {
    console.log('\nFallos:');
    results.errors.forEach((e) => console.log(` - ${e.name}: ${e.status}`, typeof e.data === 'object' && e.data ? e.data.message || '' : e.data));
  }
  process.exit(results.fail > 0 ? 1 : 0);
}

run().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
