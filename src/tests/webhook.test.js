require('./setup');
const request = require('supertest');
const app = require('../app');
const StripeEvent = require('../models/StripeEvent');

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn().mockImplementation((_body, _sig, _secret) => ({
        id: 'evt_test_idempotencia_001',
        type: 'checkout.session.completed',
        data: { object: { metadata: { ordenId: null } } },
      })),
    },
  }));
});

function buildWebhookRequest() {
  return request(app)
    .post('/api/webhooks/stripe')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', 'fake_sig_test')
    .send(Buffer.from(JSON.stringify({ id: 'evt_test_idempotencia_001' })));
}

describe('Stripe Webhook — idempotencia', () => {
  test('Primer evento es procesado correctamente', async () => {
    const res = await buildWebhookRequest();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const event = await StripeEvent.findOne({ eventId: 'evt_test_idempotencia_001' });
    expect(event).toBeTruthy();
  });

  test('Segundo evento con mismo ID retorna 200 sin reprocesar', async () => {
    await buildWebhookRequest();
    const res = await buildWebhookRequest();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Evento ya procesado');

    const count = await StripeEvent.countDocuments({ eventId: 'evt_test_idempotencia_001' });
    expect(count).toBe(1);
  });
});
