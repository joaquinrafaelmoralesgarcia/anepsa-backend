const { Router } = require('express');
const { register, registerFirst, login, refresh, logout } = require('../controllers/authController');
const { authRequired } = require('../middlewares/authRequired');

const router = Router();

router.post('/register', authRequired, register);
router.post('/register-first', registerFirst);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
