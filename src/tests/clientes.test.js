require('./setup');
const request = require('supertest');
const app = require('../app');

async function getAdminToken() {
  const adminData = { nombre: 'Admin', email: 'admin@test.com', password: 'Test1234!', rol: 'admin' };
  await request(app).post('/api/auth/register-first').send(adminData);
  const res = await request(app).post('/api/auth/login').send({ email: adminData.email, password: adminData.password });
  return res.body.data.accessToken;
}

describe('Clientes CRUD', () => {
  let token;

  beforeEach(async () => {
    token = await getAdminToken();
  });

  test('POST /api/clientes crea un cliente correctamente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Juan Pérez',
        RFC: 'PEPJ800101AAA',
        email: 'juan@test.com',
        telefono: '5551234567',
        direccion: 'Calle Falsa 123, CDMX',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe('Juan Pérez');
  });

  test('POST /api/clientes valida campos requeridos', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Solo nombre' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /api/clientes retorna lista', async () => {
    await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Test', RFC: 'TESX000101XXX', email: 'test@test.com', telefono: '5550000000', direccion: 'Dirección Test' });

    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
