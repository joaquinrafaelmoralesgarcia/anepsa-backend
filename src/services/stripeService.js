const Stripe = require('stripe');

let stripeClient = null;

function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

async function createPaymentLink(orden) {
  const stripe = getStripe();

  const session = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Anticipo Avalúo #${orden._id}`,
            description: `50% de anticipo sin IVA para orden de valuación`,
          },
          unit_amount: orden.anticipo * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      ordenId: orden._id.toString(),
    },
  });

  return { url: session.url, id: session.id };
}

module.exports = { createPaymentLink };
