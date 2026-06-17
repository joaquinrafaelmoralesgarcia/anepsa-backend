const mongoose = require('mongoose');

const stripeEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StripeEvent', stripeEventSchema);
