const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../config/constants');
const { success, error } = require('../utils/response');

const refreshTokens = new Set();

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return error(res, 'VALIDATION_ERROR', 'nombre, email, password y rol son requeridos');
  }

  if (!Object.values(ROLES).includes(rol)) {
    return error(res, 'VALIDATION_ERROR', `Rol inválido. Valores permitidos: ${Object.values(ROLES).join(', ')}`);
  }

  const caller = req.user;
  if (rol === ROLES.ADMIN && (!caller || caller.rol !== ROLES.ADMIN)) {
    return error(res, 'FORBIDDEN', 'Solo un admin puede crear usuarios admin', 403);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return error(res, 'CONFLICT', 'El email ya está registrado', 409);
  }

  const user = await User.create({ nombre, email, password, rol });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  refreshTokens.add(refreshToken);

  return success(res, { user, accessToken, refreshToken }, 201);
}

// Crea el primer usuario admin del sistema (sin requerir autenticación previa)
async function registerFirst(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return error(res, 'VALIDATION_ERROR', 'nombre, email, password y rol son requeridos');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return error(res, 'CONFLICT', 'El email ya está registrado', 409);
  }

  const user = await User.create({ nombre, email, password, rol });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  refreshTokens.add(refreshToken);

  return success(res, { user, accessToken, refreshToken }, 201);
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'VALIDATION_ERROR', 'email y password son requeridos');
  }

  const user = await User.findOne({ email, activo: true });
  if (!user || !(await user.comparePassword(password))) {
    return error(res, 'INVALID_CREDENTIALS', 'Credenciales inválidas', 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  refreshTokens.add(refreshToken);

  return success(res, { user, accessToken, refreshToken });
}

function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return error(res, 'INVALID_TOKEN', 'Refresh token inválido', 401);
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    return success(res, { accessToken });
  } catch {
    refreshTokens.delete(refreshToken);
    return error(res, 'INVALID_TOKEN', 'Refresh token expirado', 401);
  }
}

function logout(req, res) {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokens.delete(refreshToken);
  return success(res, { message: 'Sesión cerrada' });
}

module.exports = { register, registerFirst, login, refresh, logout };
