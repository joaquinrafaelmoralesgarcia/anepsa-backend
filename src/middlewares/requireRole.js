const { error } = require('../utils/response');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'UNAUTHORIZED', 'No autenticado', 401);
    }
    if (!roles.includes(req.user.rol)) {
      return error(res, 'FORBIDDEN', 'Acceso denegado para tu rol', 403);
    }
    next();
  };
}

module.exports = { requireRole };
