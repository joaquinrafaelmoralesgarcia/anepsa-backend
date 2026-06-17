const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

function authRequired(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'UNAUTHORIZED', 'Se requiere token de autenticación', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return error(res, 'INVALID_TOKEN', 'Token inválido o expirado', 401);
  }
}

module.exports = { authRequired };
