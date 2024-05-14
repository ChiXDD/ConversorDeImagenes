const express = require('express');
const router = express.Router();
const passport = require('passport');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', (req, res) => {
    res.render('inicio_sesion', { titulo: 'Inicio de Sesión' });
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/inicio_sesion',
  failureFlash: true
}), async (req, res) => {
  // Si se autentica correctamente, crea un token JWT
  const token = authMiddleware.generateToken(req.user.id);

  res.cookie('token', token, { httpOnly: true, secure: false });
  res.redirect('/');
});

module.exports = router;