# CLUB MASTER

Sistema SaaS para bares y discotecas. Permite a los clientes pedir desde su mesa, al staff gestionar pedidos en tiempo real y al administrador controlar el negocio completo.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router, Axios |
| Backend | Node.js, Express, JWT |
| Base de datos | MySQL |

## Identidad visual

- Fondo: `#000000` / `#111111`
- Dorado: `#D4AF37` / `#F4C542`
- Texto: `#FFFFFF` / `#BDBDBD`

## Estructura

```
club_master/
├── club-master-frontend/   # React + Vite
├── club-master-backend/    # Express API
│   └── database/
│       ├── schema.sql
│       └── seed.sql
```

## Inicio rápido

### Backend

```bash
cd club-master-backend
npm install
# Configurar .env (ver .env.example)
npm run db:migrate   # Crear tablas y datos iniciales
npm run dev          # http://localhost:3001
```

### Frontend

```bash
cd club-master-frontend
npm install
npm run dev          # http://localhost:5173
```

## Usuarios demo (modo mock activo por defecto)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@clubmaster.com | admin123 |
| Staff | staff@clubmaster.com | staff123 |
| Cliente | cliente@clubmaster.com | cliente123 |

## Flujos

- **Cliente**: Bienvenida → Login/Registro/Invitado → Mesa → Menú → Carrito → Pago → Seguimiento
- **Staff**: Dashboard de pedidos en tiempo real
- **Admin**: Panel SaaS con dashboard, productos, inventario, reportes, etc.

## API

- `GET /api/health` — Estado del servidor
- `POST /api/auth/login` — Iniciar sesión
- `GET /api/mock/*` — Datos de demostración (sin BD)

Con MySQL configurado, usar rutas `/api/auth`, `/api/productos`, `/api/pedidos`, `/api/admin`, etc.
