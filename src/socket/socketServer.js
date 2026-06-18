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
    console.log(`[SOCKET] Conectado: ${user.nombre} (${user.rol}) id=${user.id}`);

    if (user.rol === ROLES.VALUADOR) {
      socket.join(user.id);
      console.log(`[SOCKET] Valuador unido al room: ${user.id}`);
    } else if (user.rol === ROLES.ADMIN) {
      socket.join('admin-activity');
      console.log(`[SOCKET] Admin unido al room: admin-activity`);
    }

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Desconectado: ${user.nombre}`);
    });
  });
}

function emitOrdenEvent(io, orden, evento, data) {
  if (orden.valuadorAsignado) {
    const valuadorId = orden.valuadorAsignado._id
      ? orden.valuadorAsignado._id.toString()
      : orden.valuadorAsignado.toString();
    console.log(`[SOCKET] Emitiendo "${evento}" al room valuador: ${valuadorId}`);
    io.to(valuadorId).emit(evento, data);
  }
  console.log(`[SOCKET] Emitiendo "${evento}" al room admin-activity`);
  io.to('admin-activity').emit(evento, data);
}

module.exports = { initSocket, emitOrdenEvent };
