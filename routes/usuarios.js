const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { verificarToken, permitirRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// 🔒 Listar fiscales (solo admin)
router.get('/fiscales', verificarToken, permitirRoles('admin'), async (req, res) => {
  try {
    const fiscales = await Usuario.find({ rol: 'fiscal' });
    res.json(fiscales);
  } catch (error) {
    console.error('❌ Error al listar fiscales:', error.message);
    res.status(500).json({ error: 'Error al listar fiscales', detalle: error.message });
  }
});

// 🔒 Crear fiscal (solo admin)
router.post('/fiscales', verificarToken, permitirRoles('admin'), async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // 🧪 Validación de campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, email y contraseña' });
    }

    // 🔍 Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido' });
    }

    // 🔍 Verificar si el email ya existe
    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    // 🔐 Hashear contraseña y fijar rol como 'fiscal'
    const hashed = await bcrypt.hash(password, 10);
    const nuevo = new Usuario({ nombre, email, password: hashed, rol: 'fiscal' });

    await nuevo.save();

    res.status(201).json({ mensaje: '✅ Fiscal creado correctamente' });
  } catch (error) {
    // 🧠 Trazabilidad del error
    console.error('❌ Error al crear fiscal:', error.message);

    // 🔍 Si el error viene de Mongoose (validación, duplicación, etc.)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Error de validación en el modelo', detalle: error.errors });
    }

    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email duplicado (índice único)' });
    }

    res.status(500).json({ error: 'Error interno al crear fiscal', detalle: error.message });
  }
});



// 🔒 Eliminar fiscal (solo admin)
router.delete('/fiscales/:id', verificarToken, permitirRoles('admin'), async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Fiscal eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar fiscal:', error.message);
    res.status(500).json({ error: 'Error al eliminar fiscal', detalle: error.message });
  }
});

module.exports = router;
