const ROLES = {
  ADMIN: 'admin',
  VALUADOR: 'valuador',
};

const ORDER_STATUS = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en proceso',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
};

const PROPERTY_TYPES = {
  CASA: 'casa',
  LOCAL: 'local',
  TERRENO: 'terreno',
};

const IVA = 0.16;

module.exports = { ROLES, ORDER_STATUS, PROPERTY_TYPES, IVA };
