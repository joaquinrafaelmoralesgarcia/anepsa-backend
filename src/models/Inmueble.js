const mongoose = require('mongoose');
const { PROPERTY_TYPES } = require('../config/constants');

const inmuebleSchema = new mongoose.Schema(
  {
    direccion: { type: String, required: true, trim: true },
    tipo: { type: String, enum: Object.values(PROPERTY_TYPES), required: true },
    metrosCuadrados: { type: Number, required: true, min: 1 },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inmueble', inmuebleSchema);
