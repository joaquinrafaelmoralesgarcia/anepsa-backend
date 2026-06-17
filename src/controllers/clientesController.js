const Cliente = require('../models/Cliente');
const { success, error } = require('../utils/response');

async function getAll(req, res) {
  const clientes = await Cliente.find().sort({ createdAt: -1 });
  return success(res, clientes);
}

async function getById(req, res) {
  const cliente = await Cliente.findById(req.params.id);
  if (!cliente) return error(res, 'NOT_FOUND', 'Cliente no encontrado', 404);
  return success(res, cliente);
}

async function create(req, res) {
  const { nombre, RFC, email, telefono, direccion } = req.body;
  if (!nombre || !RFC || !email || !telefono || !direccion) {
    return error(res, 'VALIDATION_ERROR', 'nombre, RFC, email, telefono y direccion son requeridos');
  }
  const cliente = await Cliente.create({ nombre, RFC, email, telefono, direccion });
  return success(res, cliente, 201);
}

async function update(req, res) {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!cliente) return error(res, 'NOT_FOUND', 'Cliente no encontrado', 404);
  return success(res, cliente);
}

async function remove(req, res) {
  const cliente = await Cliente.findByIdAndDelete(req.params.id);
  if (!cliente) return error(res, 'NOT_FOUND', 'Cliente no encontrado', 404);
  return success(res, { message: 'Cliente eliminado' });
}

module.exports = { getAll, getById, create, update, remove };
