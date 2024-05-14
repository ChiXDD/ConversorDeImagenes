const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const index = require('./index');
const inicio_sesion = require('./inicio_sesion');
const registro = require('./registro');
const registroNuevo = require('./registro_nuevo');
const convertirPNG = require('./convertirPNG');
const convertirJPG = require('./convertirJPG');
const convertirJPEG = require('./convertirJPEG');
const convertirWEBP = require('./convertirWEBP');

router.use('/', index);
router.use('/inicio_sesion', inicio_sesion);
router.use('/registro', registro);
router.use('/registro_nuevo', registroNuevo);
router.use('/convertirPNG', convertirPNG);
router.use('/convertirJPG', convertirJPG);
router.use('/convertirJPEG', convertirJPEG);
router.use('/convertirWEBP', convertirWEBP);

module.exports = router;