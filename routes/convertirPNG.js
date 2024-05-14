const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const JSZip = require('jszip');
const checkCredits = require('../middlewares/checarCreditos');
const { obtenerConexion } = require('../database/conexion');

router.get('/', (req, res) => {
    res.render('convertirPNG', { titulo: 'Conversor a PNG'});
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', checkCredits, upload.array('conPNG', 100), async (req, res) => {
    if (req.user) {
        const connection = await obtenerConexion();
        
        try {
            // Verificar si se subieron imágenes
            if (req.files.length === 0) {
                return res.status(400).send('No se subieron imágenes');
            }

            // Convertir las imágenes
            const conversions = req.files.map(async (file, index) => {
                const buffer = await sharp(file.buffer).toFormat('png').toBuffer();
                return { filename: `imagen_${index + 1}.png`, buffer };
            });

            const images = req.files.map(file => file);

            // Insertar los datos en la tabla imagenes_subidas
            const userId = req.user.id; // Suponiendo que tienes el ID del usuario en req.user.id
            const insertarImagenSubida = "INSERT INTO imagen_subida (imagen_subida, id_usuario) VALUES ?";
            const imagenSubidaValues = images.map(file => [file.buffer.toString('base64'), userId]);
            
            connection.query(insertarImagenSubida, [imagenSubidaValues], async (error, results, fields) => {
                if (error) {
                    console.error('Error al insertar en la tabla imagenes_subidas:', error);
                    throw error;
                }
                console.log('Datos insertados en la tabla imagenes_subidas:', results);
            });
    
            // Esperar a que todas las conversiones se completen
            const files = await Promise.all(conversions);
    
            // Crear un archivo ZIP si se subieron más de una imagen
            if (req.files.length > 1) {
                const zip = new JSZip();
                files.forEach(({ filename, buffer }) => {
                    zip.file(filename, buffer);
                });
                
                // Generar el contenido del archivo ZIP
                const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
                // Enviar el archivo ZIP al navegador del usuario
                res.set('Content-Disposition', 'attachment; filename=imagenes_convertidas.zip');
                res.set('Content-Type', 'application/zip');

                const insertarImagenConvertida = "INSERT INTO imagen_convertida (imagen_convertida, id_usuario) VALUES ?";
                const imagenConvertidaValues = files.map(files => [files.buffer.toString('base64'), userId]);
                
                connection.query(insertarImagenConvertida, [imagenConvertidaValues], async (error, results, fields) => {
                    if (error) {
                        console.error('Error al insertar en la tabla imagen_convertida:', error);
                        throw error;
                    }
                    console.log('Datos insertados en la tabla imagen_convertida:', results);
                });
    
                return res.send(zipBuffer);
            } else {
                // Si se subió una sola imagen, enviarla como una descarga directa
                const file = files[0];
                res.set('Content-Disposition', `attachment; filename="imagen_convertida_${Date.now()}.png"`);
                res.set('Content-Type', 'image/png');

                // Insertar los datos en la tabla imagenes_subidas
                const userId = req.user.id; // Suponiendo que tienes el ID del usuario en req.user.id
                const insertarImagenConvertida = "INSERT INTO imagen_convertida (imagen_convertida, id_usuario) VALUES ?";
                const imagenConvertidaValues = files.map((file, index) => [file.buffer.toString('base64'), userId]);
                
                connection.query(insertarImagenConvertida, [imagenConvertidaValues], async (error, results, fields) => {
                    if (error) {
                        console.error('Error al insertar en la tabla imagen_convertida:', error);
                        throw error;
                    }
                    console.log('Datos insertados en la tabla imagen_convertida:', results);
                });
    
                return res.send(file.buffer);
            }
        } catch (err) {
            console.error('Error al convertir las imágenes:', err);
            // Redirigir al usuario al index con un mensaje de error
            return res.redirect('/?error=Error al convertir las imágenes');
        }
    } else {
        try {
            // Verificar si se subieron imágenes
            if (req.files.length === 0) {
                return res.status(400).send('No se subieron imágenes');
            }
    
            // Obtener el número de créditos del usuario
            let credits = req.cookies.credits || 0;
    
            // Verificar si el usuario tiene suficientes créditos
            if (credits < req.files.length) {
                return res.redirect('/?error=No tienes suficientes créditos para realizar estas conversiones, por favor inicia sesión o regístrate');
            }
    
            // Convertir las imágenes
            const conversions = req.files.map(async (file, index) => {
                const buffer = await sharp(file.buffer).toFormat('png').toBuffer();
                return { filename: `imagen_${index + 1}.png`, buffer };
            });
    
            // Esperar a que todas las conversiones se completen
            const files = await Promise.all(conversions);
    
            // Crear un archivo ZIP si se subieron más de una imagen
            if (req.files.length > 1) {
                const zip = new JSZip();
                files.forEach(({ filename, buffer }) => {
                    zip.file(filename, buffer);
                });
    
                // Generar el contenido del archivo ZIP
                const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
                // Enviar el archivo ZIP al navegador del usuario
                res.set('Content-Disposition', 'attachment; filename=imagenes_convertidas.zip');
                res.set('Content-Type', 'application/zip');
    
                // Reducir el número de créditos del usuario
                credits -= req.files.length;
    
                // Configurar la cookie con los créditos actualizados
                res.cookie('credits', credits);
    
                return res.send(zipBuffer);
            } else {
                // Si se subió una sola imagen, enviarla como una descarga directa
                const file = files[0];
                res.set('Content-Disposition', `attachment; filename="imagen_convertida_${Date.now()}.png"`);
                res.set('Content-Type', 'image/png');
    
                // Reducir el número de créditos del usuario
                credits--;
    
                // Configurar la cookie con los créditos actualizados
                res.cookie('credits', credits);
                return res.send(file.buffer);
            }
        } catch (err) {
            console.error('Error al convertir las imágenes:', err);
            // Redirigir al usuario al index con un mensaje de error
            return res.redirect('/?error=Error al convertir las imágenes');
        }
    }
});

module.exports = router;