/**
 * Inserta pedidos de demostración para el panel staff.
 * Uso: npm run db:seed-pedidos
 */
import { query } from '../config/db.js';

const DEMO_TAG = 'DEMO_SEED';

const PEDIDOS_DEMO = [
  {
    mesa: 3,
    estado: 'pendiente_aprobacion',
    nombre: 'Ana García',
    notas: 'Mesa terraza — esperando aprobación',
    items: [{ producto_id: 17, cantidad: 2 }, { producto_id: 28, cantidad: 2 }],
    minutosAtras: 3,
  },
  {
    mesa: 8,
    estado: 'pendiente_aprobacion',
    nombre: 'Luis Pérez',
    notas: 'Pedido recién enviado por el cliente',
    items: [{ producto_id: 10, cantidad: 4 }],
    minutosAtras: 1,
  },
  {
    mesa: 2,
    estado: 'recibido',
    nombre: 'Carlos Ruiz',
    notas: 'Aprobado — listo para preparar',
    items: [{ producto_id: 21, cantidad: 1 }],
    minutosAtras: 12,
  },
  {
    mesa: 4,
    estado: 'en_preparacion',
    nombre: 'María López',
    notas: 'Bar preparando cócteles',
    items: [{ producto_id: 18, cantidad: 2 }, { producto_id: 25, cantidad: 1 }],
    minutosAtras: 18,
  },
  {
    mesa: 9,
    estado: 'listo',
    nombre: 'Pedro Santos',
    notas: 'Listo para servir en mesa',
    items: [{ producto_id: 1, cantidad: 1 }, { producto_id: 11, cantidad: 2 }],
    minutosAtras: 25,
  },
  {
    mesa: 11,
    estado: 'en_camino',
    nombre: 'Sofía Torres',
    notas: 'Mesero en camino a la mesa',
    items: [{ producto_id: 24, cantidad: 1 }, { producto_id: 15, cantidad: 2 }],
    minutosAtras: 30,
  },
  {
    mesa: 1,
    estado: 'entregado',
    nombre: 'Cliente VIP',
    notas: 'Pedido completado',
    items: [{ producto_id: 14, cantidad: 6 }],
    minutosAtras: 90,
  },
  {
    mesa: 6,
    estado: 'entregado',
    nombre: 'Invitado Mesa 6',
    notas: 'Entregado hace una hora',
    items: [{ producto_id: 20, cantidad: 3 }, { producto_id: 27, cantidad: 2 }],
    minutosAtras: 120,
  },
  {
    mesa: 5,
    estado: 'recibido',
    nombre: 'Staff — pedido manual',
    notas: 'Tomado por mesero en mostrador',
    items: [{ producto_id: 22, cantidad: 1 }, { producto_id: 17, cantidad: 2 }],
    minutosAtras: 8,
  },
  {
    mesa: 12,
    estado: 'en_preparacion',
    nombre: 'Daniela Mora',
    notas: 'Combo fin de semana',
    items: [{ producto_id: 23, cantidad: 1 }],
    minutosAtras: 15,
  },
];

async function getEstadoId(nombre) {
  const rows = await query('SELECT id FROM estados_pedido WHERE nombre = ?', [nombre]);
  return rows[0]?.id;
}

async function getMesaId(numero) {
  const rows = await query('SELECT id FROM mesas WHERE numero = ? AND activa = 1', [numero]);
  return rows[0]?.id;
}

async function getProducto(productoId) {
  const rows = await query('SELECT id, precio, precio_descuento, descuento_activo FROM productos WHERE id = ?', [productoId]);
  return rows[0];
}

function precioUnitario(prod) {
  if (prod.descuento_activo && prod.precio_descuento) return Number(prod.precio_descuento);
  return Number(prod.precio);
}

async function seedPedidos({ reset = true } = {}) {
  if (reset) {
    await query(
      `DELETE dp FROM detalle_pedido dp
       INNER JOIN pedidos p ON p.id = dp.pedido_id
       WHERE p.notas LIKE ?`,
      [`%${DEMO_TAG}%`]
    );
    await query('DELETE FROM historial_pedido WHERE pedido_id IN (SELECT id FROM pedidos WHERE notas LIKE ?)', [`%${DEMO_TAG}%`]);
    await query('DELETE FROM pedidos WHERE notas LIKE ?', [`%${DEMO_TAG}%`]);
    console.log('Pedidos demo anteriores eliminados.');
  }

  const clienteRows = await query('SELECT id FROM usuarios WHERE email = ?', ['cliente@clubmaster.com']);
  const usuarioId = clienteRows[0]?.id || null;

  let creados = 0;

  for (const demo of PEDIDOS_DEMO) {
    const mesaId = await getMesaId(demo.mesa);
    const estadoId = await getEstadoId(demo.estado);
    if (!mesaId || !estadoId) {
      console.warn(`Omitido pedido mesa ${demo.mesa} estado ${demo.estado}: datos no encontrados`);
      continue;
    }

    let subtotal = 0;
    const lineas = [];
    for (const item of demo.items) {
      const prod = await getProducto(item.producto_id);
      if (!prod) continue;
      const precio = precioUnitario(prod);
      const lineSub = precio * item.cantidad;
      subtotal += lineSub;
      lineas.push({ producto_id: prod.id, cantidad: item.cantidad, precio_unitario: precio, subtotal: lineSub });
    }
    if (!lineas.length) continue;

    const notas = `${demo.notas} [${DEMO_TAG}]`;
    const createdAt = new Date(Date.now() - demo.minutosAtras * 60 * 1000);

    const result = await query(
      `INSERT INTO pedidos (usuario_id, mesa_id, estado_id, subtotal, total, notas, nombre_cliente, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, mesaId, estadoId, subtotal, subtotal, notas, demo.nombre, createdAt]
    );
    const pedidoId = result.insertId;

    for (const linea of lineas) {
      await query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [pedidoId, linea.producto_id, linea.cantidad, linea.precio_unitario, linea.subtotal]
      );
    }

    await query(
      'INSERT INTO historial_pedido (pedido_id, estado_id, comentario, created_at) VALUES (?, ?, ?, ?)',
      [pedidoId, estadoId, `Pedido demo — ${demo.estado}`, createdAt]
    );

    creados += 1;
    console.log(`  ✓ Mesa ${demo.mesa} · ${demo.nombre} · ${demo.estado} · $${subtotal.toLocaleString('es-CO')}`);
  }

  console.log(`\n${creados} pedidos demo creados.`);
  return creados;
}

const isMain = process.argv[1]?.includes('seedPedidos');
if (isMain) {
  seedPedidos()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

export default seedPedidos;
