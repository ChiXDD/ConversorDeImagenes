async function checarCreditos(req, res, next) {
    try {
        // Verifica si el usuario está autenticado
        if (req.user){
            return next();
        } else {
            // Verifica si hay una cookie con los créditos
            if (!req.cookies.credits) {
                // Si no hay cookie de créditos, crea una nueva y establece el valor inicial en 3
                res.cookie('credits', 3); // Establece la cookie con una duración de 24 horas (en milisegundos)
            }
            return next();
        }
    } catch (err) {
        console.error('Error al verificar los créditos:', err);
        return res.redirect('/?error=Error al verificar los créditos');
    }
};

module.exports = checarCreditos;