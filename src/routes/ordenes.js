const { Router } = require('express');
const ctrl = require('../controllers/ordenesController');
const { authRequired } = require('../middlewares/authRequired');
const { requireRole } = require('../middlewares/requireRole');
const { ROLES } = require('../config/constants');

const router = Router();

router.use(authRequired);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', requireRole(ROLES.ADMIN), ctrl.create);
router.put('/:id', requireRole(ROLES.ADMIN), ctrl.update);
router.delete('/:id', requireRole(ROLES.ADMIN), ctrl.remove);

module.exports = router;
