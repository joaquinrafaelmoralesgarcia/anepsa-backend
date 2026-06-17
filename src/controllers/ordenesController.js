const Orden = require('../models/Orden');
const { ORDER_STATUS, ROLES } = require('../config/constants');
const { success, error } = require('../utils/response');
const stripeService = require('../services/stripeService');

let io = null;

function setIo(socketIo) {
  io = socketIo;
}

async function getAll(req, res) {
  const filter = {};
  if (req.user.rol === ROLES.VALUADOR) {
    filter.valuadorAsignado = req.user.id;
  }
  const ordenes = await Orden.find(filter)
    .populate('inmueble', 'direccion tipo')
    .populate('valuadorAsignado', 'nombre email')
    .sort({ createdAt: -1 });
  return success(res, ordenes);
}

async function getById(req, res) {
  const orden = await Orden.findById(req.params.id)
    .populate('inmueble', 'direccion tipo metrosCuadrados')
    .populate('valuadorAsignado', 'nombre email');

  if (!orden) return error(res, 'NOT_FOUND', 'Orden no encontrada', 404);

  if (req.user.rol === ROLES.VALUADOR && orden.valuadorAsignado?.toString() !== req.user.id) {
    return error(res, 'FORBIDDEN', 'No tienes acceso a esta orden', 403);
  }

  return success(res, orden);
}

async function create(req, res) {
  const { inmueble, monto, fecha } = req.body;

  if (!inmueble || !monto) {
    return error(res, 'VALIDATION_ERROR', 'inmueble y monto son requeridos');
  }

  const orden = new Orden({ inmueble, monto, fecha });
  await orden.save();

  try {
    const link = await stripeService.createPaymentLink(orden);
    orden.anticipoUrl = link.url;
    orden.stripePaymentLinkId = link.id;
    await orden.save();
  } catch (_err) {
    // Stripe puede fallar en ambiente de prueba; la orden queda sin anticipoUrl
  }

  return success(res, orden, 201);
}

async function update(req, res) {
  const { estatus, valuadorAsignado } = req.body;

  if (req.user.rol === ROLES.VALUADOR) {
    return error(res, 'FORBIDDEN', 'Los valuadores no pueden editar órdenes', 403);
  }

  if (estatus === ORDER_STATUS.CANCELADA && req.user.rol !== ROLES.ADMIN) {
    return error(res, 'FORBIDDEN', 'Solo admin puede cancelar órdenes', 403);
  }

  const orden = await Orden.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('inmueble', 'direccion tipo')
    .populate('valuadorAsignado', 'nombre email');

  if (!orden) return error(res, 'NOT_FOUND', 'Orden no encontrada', 404);

  if (io) {
    const { emitOrdenEvent } = require('../socket/socketServer');
    const evento = valuadorAsignado ? 'orden:asignada' : 'orden:actualizada';
    emitOrdenEvent(io, orden, evento, { orden });
  }

  return success(res, orden);
}

async function remove(req, res) {
  const orden = await Orden.findByIdAndDelete(req.params.id);
  if (!orden) return error(res, 'NOT_FOUND', 'Orden no encontrada', 404);
  return success(res, { message: 'Orden eliminada' });
}

module.exports = { getAll, getById, create, update, remove, setIo };
