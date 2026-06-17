const Inmueble = require('../models/Inmueble');
const Cliente = require('../models/Cliente');
const { PROPERTY_TYPES } = require('../config/constants');
const { success, error } = require('../utils/response');

async function getAll(req, res) {
  const inmuebles = await Inmueble.find().populate('cliente', 'nombre email').sort({ createdAt: -1 });
  return success(res, inmuebles);
}

async function getById(req, res) {
  const inmueble = await Inmueble.findById(req.params.id).populate('cliente', 'nombre email');
  if (!inmueble) return error(res, 'NOT_FOUND', 'Inmueble no encontrado', 404);
  return success(res, inmueble);
}

async function create(req, res) {
  const { direccion, tipo, metrosCuadrados, cliente } = req.body;

  if (!direccion || !tipo || !metrosCuadrados || !cliente) {
    return error(res, 'VALIDATION_ERROR', 'direccion, tipo, metrosCuadrados y cliente son requeridos');
  }

  if (!Object.values(PROPERTY_TYPES).includes(tipo)) {
    return error(res, 'VALIDATION_ERROR', `tipo debe ser: ${Object.values(PROPERTY_TYPES).join(', ')}`);
  }

  const clienteDoc = await Cliente.findById(cliente);
  if (!clienteDoc) return error(res, 'NOT_FOUND', 'Cliente no encontrado', 404);

  const inmueble = await Inmueble.create({ direccion, tipo, metrosCuadrados, cliente });
  return success(res, inmueble, 201);
}

async function update(req, res) {
  const inmueble = await Inmueble.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!inmueble) return error(res, 'NOT_FOUND', 'Inmueble no encontrado', 404);
  return success(res, inmueble);
}

async function remove(req, res) {
  const inmueble = await Inmueble.findByIdAndDelete(req.params.id);
  if (!inmueble) return error(res, 'NOT_FOUND', 'Inmueble no encontrado', 404);
  return success(res, { message: 'Inmueble eliminado' });
}

module.exports = { getAll, getById, create, update, remove };
