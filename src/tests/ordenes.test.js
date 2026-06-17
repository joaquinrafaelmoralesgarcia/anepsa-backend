require('./setup');
const request = require('supertest');
const app = require('../app');

jest.mock('../services/stripeService', () => ({
  createPaymentLink: jest.fn().mockResolvedValue({
    url: 'https://buy.stripe.com/test_mock_link',
    id: 'plink_test_mock',
  }),
}));

async function setupAdmin() {
  const adminData = { nombre: 'Admin', email: 'admin@test.com', password: 'Test1234!', rol: 'admin' };
  await request(app).post('/api/auth/register-first').send(adminData);
  const res = await request(app).post('/api/auth/login').send({ email: adminData.email, password: adminData.password });
  return res.body.data.accessToken;
}

async function createClienteAndInmueble(token) {
  const clienteRes = await request(app)
    .post('/api/clientes')
    .set('Authorization', `Bearer ${token}`)
    .send({ nombre: 'Cliente Test', RFC: 'CLTX800101AAA', email: 'cliente@test.com', telefono: '5550000001', direccion: 'Dirección 1' });

  const inmuebleRes = await request(app)
    .post('/api/inmuebles')
    .set('Authorization', `Bearer ${token}`)
    .send({ direccion: 'Av. Reforma 100', tipo: 'casa', metrosCuadrados: 120, cliente: clienteRes.body.data._id });

  return inmuebleRes.body.data._id;
}

describe('Ordenes', () => {
  let token;
  let inmuebleId;

  beforeEach(async () => {
    token = await setupAdmin();
    inmuebleId = await createClienteAndInmueble(token);
  });

  test('POST /api/ordenes crea orden y genera anticipoUrl (mockeado)', async () => {
    const res = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${token}`)
      .send({ inmueble: inmuebleId, monto: 50000 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.anticipoUrl).toBe('https://buy.stripe.com/test_mock_link');
    expect(res.body.data.anticipo).toBeGreaterThan(0);
  });

  test('POST /api/ordenes calcula anticipo = 50% del monto sin IVA', async () => {
    const monto = 116000; // IVA incluido; monto sin IVA = 100000; anticipo = 50000
    const res = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${token}`)
      .send({ inmueble: inmuebleId, monto });

    expect(res.status).toBe(201);
    expect(res.body.data.anticipo).toBe(50000);
  });
});
