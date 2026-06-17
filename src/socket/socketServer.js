const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

function initSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.query?.token || socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Token requerido para conectar'));
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    if (user.rol === ROLES.VALUADOR) {
      socket.join(user.id);
    } else if (user.rol === ROLES.ADMIN) {
      socket.join('admin-activity');
    }

    socket.on('disconnect', () => {});
  });
}

function emitOrdenEvent(io, orden, evento, data) {
  if (orden.valuadorAsignado) {
    io.to(orden.valuadorAsignado.toString()).emit(evento, data);
  }
  io.to('admin-activity').emit(evento, data);
}

module.exports = { initSocket, emitOrdenEvent };
