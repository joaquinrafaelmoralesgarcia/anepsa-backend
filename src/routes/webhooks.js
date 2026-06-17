const { Router } = require('express');
const { handleStripeWebhook } = require('../controllers/webhookController');

const router = Router();

// express.raw se aplica en app.js ANTES de express.json para este path
router.post('/stripe', handleStripeWebhook);

module.exports = router;
