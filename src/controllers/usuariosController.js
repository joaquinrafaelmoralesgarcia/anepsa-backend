const User = require('../models/User');
const { ROLES } = require('../config/constants');
const { success, error } = require('../utils/response');

async function getAll(req, res) {
  const usuarios = await User.find().sort({ createdAt: -1 });
  return success(res, usuarios);
}

async function getById(req, res) {
  const usuario = await User.findById(req.params.id);
  if (!usuario) return error(res, 'NOT_FOUND', 'Usuario no encontrado', 404);
  return success(res, usuario);
}

async function create(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return error(res, 'VALIDATION_ERROR', 'nombre, email, password y rol son requeridos');
  }

  if (rol === ROLES.ADMIN && req.user.rol !== ROLES.ADMIN) {
    return error(res, 'FORBIDDEN', 'Solo admin puede crear usuarios admin', 403);
  }

  const exists = await User.findOne({ email });
  if (exists) return error(res, 'CONFLICT', 'El email ya está registrado', 409);

  const usuario = await User.create({ nombre, email, password, rol });
  return success(res, usuario, 201);
}

async function update(req, res) {
  const { password, ...rest } = req.body;
  const update = { ...rest };

  if (password) {
    const bcrypt = require('bcryptjs');
    update.password = await bcrypt.hash(password, 12);
  }

  const usuario = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!usuario) return error(res, 'NOT_FOUND', 'Usuario no encontrado', 404);
  return success(res, usuario);
}

async function deactivate(req, res) {
  const usuario = await User.findByIdAndUpdate(
    req.params.id,
    { activo: false },
    { new: true }
  );
  if (!usuario) return error(res, 'NOT_FOUND', 'Usuario no encontrado', 404);
  return success(res, usuario);
}

module.exports = { getAll, getById, create, update, deactivate };
