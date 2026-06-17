const mongoose = require('mongoose');
const { ORDER_STATUS, IVA } = require('../config/constants');

const ordenSchema = new mongoose.Schema(
  {
    inmueble: { type: mongoose.Schema.Types.ObjectId, ref: 'Inmueble', required: true },
    valuadorAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fecha: { type: Date, default: Date.now },
    estatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDIENTE },
    monto: { type: Number, required: true, min: 0 },
    // anticipo = 50% del monto antes de IVA; IVA 16% ya está incluido en monto
    anticipo: { type: Number },
    anticipoUrl: { type: String, default: null },
    pagoAnticipo: { type: Boolean, default: false },
    stripePaymentLinkId: { type: String, default: null },
    stripeEventId: { type: String, default: null },
  },
  { timestamps: true }
);

ordenSchema.pre('save', function (next) {
  if (this.isModified('monto') || this.isNew) {
    // Anticipo = 50% del valor sin IVA
    this.anticipo = Math.floor((this.monto / (1 + IVA)) * 0.5);
  }
  next();
});

module.exports = mongoose.model('Orden', ordenSchema);
