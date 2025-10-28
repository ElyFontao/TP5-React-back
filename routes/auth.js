const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const router = express.Router();

const SECRET = 'clave-catamarca'; // 🔐 Usar .env en producción

// 🔐 Login real desde MongoDB
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Comparar contraseña con bcrypt
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token con rol y nombre
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
      SECRET,
      { expiresIn: '2h' }
    );

    // Responder con token y datos del usuario
    res.json({
      token,
      usuario: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ error: 'Error interno en login', detalle: error.message });
  }
});

module.exports = router;
