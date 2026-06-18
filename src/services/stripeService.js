const Stripe = require('stripe');

let stripeClient = null;

function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Crea un Checkout Session con metadata en el payment_intent para que
// el webhook payment_intent.succeeded pueda identificar la orden.
async function createPaymentLink(orden) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Anticipo Avalúo #${orden._id}`,
            description: '50% de anticipo sin IVA para orden de valuación',
          },
          unit_amount: orden.anticipo * 100,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: { ordenId: orden._id.toString() },
    },
    metadata: { ordenId: orden._id.toString() },
    success_url: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/pago-exitoso',
    cancel_url: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/pago-cancelado',
  });

  return { url: session.url, id: session.id };
}

module.exports = { createPaymentLink };
