require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket/socketServer');
const { setIo: setOrdenIo } = require('./controllers/ordenesController');
const { setIo: setWebhookIo } = require('./controllers/webhookController');

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

initSocket(io);
setOrdenIo(io);
setWebhookIo(io);

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`ANEPSA backend corriendo en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error al iniciar servidor:', err);
  process.exit(1);
});
