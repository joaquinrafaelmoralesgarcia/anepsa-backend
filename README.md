# anepsa-backend

[![CI](https://github.com/joaquinrafaelmoralesgarcia/anepsa-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/joaquinrafaelmoralesgarcia/anepsa-backend/actions/workflows/ci.yml)

API REST para el sistema de gestión de órdenes de avalúo de ANEPSA.

**Stack:** Node.js · Express · MongoDB (Mongoose) · JWT · Stripe · Socket.io · Jest · Docker

---

## Instalación local

```bash
git clone https://github.com/TU_USUARIO/anepsa-backend.git
cd anepsa-backend
npm install
cp .env.example .env
# Editar .env con tus valores reales
```

### Levantar con Docker Compose (recomendado)

```bash
docker-compose up -d
```

### Levantar sin Docker

```bash
# Requiere MongoDB corriendo en localhost:27017
npm run dev
```

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default: 3000) |
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar access tokens (mín. 32 chars) |
| `JWT_EXPIRES_IN` | Duración del access token (ej: `15m`) |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens (mín. 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token (ej: `7d`) |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe (`whsec_...`) |

---

## Endpoints

### Auth
| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register-first` | No | Crear primer admin |
| POST | `/api/auth/register` | Admin | Crear usuarios |
| POST | `/api/auth/login` | No | Iniciar sesión |
| POST | `/api/auth/refresh` | No | Renovar access token |
| POST | `/api/auth/logout` | No | Cerrar sesión |

### Clientes / Inmuebles / Ordenes / Usuarios
- `GET /api/{recurso}` — listar
- `GET /api/{recurso}/:id` — detalle
- `POST /api/{recurso}` — crear (admin)
- `PUT /api/{recurso}/:id` — actualizar (admin)
- `DELETE /api/{recurso}/:id` — eliminar (admin)

### Webhook
- `POST /api/webhooks/stripe` — recibir eventos de Stripe (sin auth, valida firma)

---

## Cálculo del anticipo

```
anticipo = floor(monto / 1.16 * 0.50)
```

El campo `monto` incluye IVA (16%). El anticipo es el 50% del valor sin IVA.

---

## Socket.io

El servidor emite eventos en tiempo real a rooms individuales:

- **Admin** entra al room `admin-activity`
- **Valuador** entra al room con su `userId`

### Eventos
| Evento | Descripción |
|--------|-------------|
| `orden:actualizada` | Cambio de estatus en una orden |
| `orden:asignada` | Valuador asignado a una orden |
| `anticipo:pagado` | Pago confirmado vía webhook |

### Conexión desde el cliente
```js
const socket = io('http://localhost:3000', {
  query: { token: 'TU_ACCESS_TOKEN_JWT' }
});
```

---

## Tests

```bash
npm test
```

12 tests en 4 suites. Cubre: auth, protección de endpoints, CRUD, Stripe mock e idempotencia de webhook.

---

## Prueba del webhook con Stripe CLI

```bash
# 1. Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
# 2. Autenticarse
stripe login

# 3. Redirigir eventos al servidor local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. En otra terminal, disparar un evento de prueba
stripe trigger checkout.session.completed
```

Para probar la idempotencia, ejecuta el trigger dos veces: la segunda respuesta incluirá `"message": "Evento ya procesado"`.

---

## Deploy en Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Crear proyecto → Deploy from GitHub
3. Agregar servicio MongoDB desde Railway
4. Configurar variables de entorno en Railway (las mismas del `.env.example`)
5. Agregar secret `RAILWAY_TOKEN` en GitHub → Settings → Secrets

El workflow `.github/workflows/deploy.yml` hace deploy automático en cada push a `main`.

---

## Secrets de GitHub Actions

| Secret | Uso |
|--------|-----|
| `RAILWAY_TOKEN` | Deploy automático a Railway |
| `MONGODB_URI` | (opcional si Railway lo inyecta) |
| `JWT_SECRET` | Signing de tokens |
| `STRIPE_SECRET_KEY` | Pagos Stripe |
| `STRIPE_WEBHOOK_SECRET` | Validar webhooks |

---

## Evidencias

Ver carpeta `evidence/README.md` para instrucciones de grabación.
