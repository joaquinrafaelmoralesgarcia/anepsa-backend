const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/inmueblesController');
const { authRequired } = require('../middlewares/authRequired');
const { requireRole } = require('../middlewares/requireRole');
const { ROLES } = require('../config/constants');

const router = Router();

router.use(authRequired);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireRole(ROLES.ADMIN), create);
router.put('/:id', requireRole(ROLES.ADMIN), update);
router.delete('/:id', requireRole(ROLES.ADMIN), remove);

module.exports = router;
