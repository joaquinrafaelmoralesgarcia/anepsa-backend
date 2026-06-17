const Stripe = require('stripe');
const Orden = require('../models/Orden');
const StripeEvent = require('../models/StripeEvent');
const { success, error } = require('../utils/response');

let io = null;

function setIo(socketIo) {
  io = socketIo;
}

async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return error(res, 'WEBHOOK_ERROR', `Firma inválida: ${err.message}`, 400);
  }

  // Idempotencia: evitar reprocesar el mismo evento
  const already = await StripeEvent.findOne({ eventId: event.id });
  if (already) {
    return success(res, { message: 'Evento ya procesado' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const ordenId = session.metadata?.ordenId;

    if (ordenId) {
      const orden = await Orden.findByIdAndUpdate(
        ordenId,
        { pagoAnticipo: true, stripeEventId: event.id },
        { new: true }
      );

      if (orden && io) {
        const { emitOrdenEvent } = require('../socket/socketServer');
        emitOrdenEvent(io, orden, 'anticipo:pagado', { orden });
      }
    }
  }

  await StripeEvent.create({ eventId: event.id });
  return success(res, { received: true });
}

module.exports = { handleStripeWebhook, setIo };
