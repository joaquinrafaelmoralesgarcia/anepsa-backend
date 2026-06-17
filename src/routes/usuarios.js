const { Router } = require('express');
const ctrl = require('../controllers/usuariosController');
const { authRequired } = require('../middlewares/authRequired');
const { requireRole } = require('../middlewares/requireRole');
const { ROLES } = require('../config/constants');

const router = Router();

router.use(authRequired, requireRole(ROLES.ADMIN));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.deactivate);

module.exports = router;
