const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('registro', { titulo: 'Registro' });
});

module.exports = router;