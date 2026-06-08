/**
 * Pruebas de integración frontend → backend
 * Uso: node scripts/test-api.mjs [baseUrl]
 * Ejemplo: node scripts/test-api.mjs http://localhost:3001/api
 */

const BASE = (process.argv[2] || process.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

const tests = [];
let passed = 0;
let failed = 0;

async function test(name, fn) {
  tests.push({ name, fn });
}

async function run() {
  console.log(`\n🔗 API base: ${BASE}\n`);

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${name}`);
      console.log(`   ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

test('Health check', async () => {
  const data = await get('/health');
  if (data.status !== 'ok') throw new Error('status !== ok');
});

test('Login mock (cliente)', async () => {
  const data = await post('/mock/auth/login', {
    email: 'cliente@clubmaster.com',
    password: 'cliente123',
  });
  if (!data.token || !data.user) throw new Error('sin token o user');
  globalThis._token = data.token;
});

test('Categorías', async () => {
  const data = await get('/mock/categorias');
  if (!Array.isArray(data) || data.length < 1) throw new Error('categorías vacías');
});

test('Productos', async () => {
  const data = await get('/mock/productos');
  if (!Array.isArray(data) || data.length < 1) throw new Error('productos vacíos');
  if (!data[0].imagen_url) throw new Error('producto sin imagen_url');
});

test('Mesas', async () => {
  const data = await get('/mock/mesas');
  if (!Array.isArray(data) || data.length < 1) throw new Error('mesas vacías');
});

test('Promociones', async () => {
  const data = await get('/mock/promociones');
  if (!Array.isArray(data)) throw new Error('promociones no es array');
});

test('Pedidos staff (con auth)', async () => {
  const login = await post('/mock/auth/login', {
    email: 'staff@clubmaster.com',
    password: 'staff123',
  });
  const res = await fetch(`${BASE}/mock/pedidos/staff?filtro=activos`, {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  if (!res.ok) throw new Error(`staff pedidos → ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('pedidos no es array');
});

test('Sesión de mesa (cliente autenticado)', async () => {
  const login = await post('/mock/auth/login', {
    email: 'cliente@clubmaster.com',
    password: 'cliente123',
  });
  const res = await fetch(`${BASE}/mock/mesas/sesiones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${login.token}`,
    },
    body: JSON.stringify({ mesa_id: 1 }),
  });
  if (!res.ok) throw new Error(`crear sesión → ${res.status}`);
  const sesion = await res.json();
  if (!sesion.mesa_id) throw new Error('sesión sin mesa_id');
});

run();
