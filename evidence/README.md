# Evidencias — anepsa-backend

## Stripe Webhook

Coloca aquí un video (MP4/GIF) demostrando:

1. El servidor corriendo localmente (`npm run dev`)
2. Stripe CLI escuchando: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Trigger del evento: `stripe trigger checkout.session.completed`
4. Log del servidor mostrando el evento recibido y `pagoAnticipo: true` en la orden
5. Consulta a la BD confirmando el cambio

**Archivo sugerido:** `evidence/stripe-webhook-demo.mp4`

---

## Socket.io — Notificaciones en tiempo real

Coloca aquí un GIF o video mostrando:

1. Dos ventanas del navegador abiertas:
   - Ventana A: sesión de **admin** en `/admin/actividad`
   - Ventana B: sesión de **valuador** en `/valuador/notificaciones`
2. Admin cambia el estatus de una orden asignada al valuador
3. Ambas ventanas reciben la notificación `orden:actualizada` sin recargar la página

**Archivo sugerido:** `evidence/sockets-demo.gif` o `evidence/sockets-demo.mp4`

---

## Pasos para reproducir

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables
cp .env.example .env
# Editar .env con tus valores reales de Stripe

# 3. Levantar MongoDB
docker-compose up -d mongo

# 4. Levantar servidor
npm run dev

# 5. Stripe CLI (en otra terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 6. Trigger de prueba
stripe trigger checkout.session.completed
```
