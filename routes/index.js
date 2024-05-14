const express = require('express');
const checarCreditos = require('../middlewares/checarCreditos');
const router = express.Router();

router.get('/', checarCreditos ,(req, res) => {
    res.render('index', { titulo: 'Conversor de Imágenes', subtitulo: req.user != null ? `¡Hola ${req.user.nombre}!` : '', user: req.user != null ? `${req.user.nombre}` : '', credits: req.cookies.credits   });
});

module.exports = router;