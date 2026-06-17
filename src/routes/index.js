const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth'));
router.use('/clientes', require('./clientes'));
router.use('/inmuebles', require('./inmuebles'));
router.use('/ordenes', require('./ordenes'));
router.use('/usuarios', require('./usuarios'));

module.exports = router;
