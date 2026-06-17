require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');
const webhookRouter = require('./routes/webhooks');
const apiRouter = require('./routes/index');

const app = express();

app.use(cors());

// El webhook de Stripe necesita el body RAW antes del json parser
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', apiRouter);

app.use(errorHandler);

module.exports = app;
