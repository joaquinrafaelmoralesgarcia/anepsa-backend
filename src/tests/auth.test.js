require('./setup');
const request = require('supertest');
const app = require('../app');

describe('Auth endpoints', () => {
  const adminData = {
    nombre: 'Admin Test',
    email: 'admin@test.com',
    password: 'Test1234!',
    rol: 'admin',
  };

  test('POST /api/auth/register-first crea primer admin', async () => {
    const res = await request(app).post('/api/auth/register-first').send(adminData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(adminData.email);
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('POST /api/auth/login devuelve token válido', async () => {
    await request(app).post('/api/auth/register-first').send(adminData);
    const res = await request(app).post('/api/auth/login').send({
      email: adminData.email,
      password: adminData.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('POST /api/auth/login con credenciales incorrectas retorna 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com',
      password: 'wrong',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Endpoint protegido rechaza request sin JWT', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Endpoint protegido rechaza token inválido', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', 'Bearer token_invalido_fake');
    expect(res.status).toBe(401);
  });
});
