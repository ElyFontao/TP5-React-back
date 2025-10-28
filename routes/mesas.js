const express = require('express');
const { verificarToken, permitirRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta protegida para fiscales y admins
router.get('/privada', verificarToken, permitirRoles('fiscal', 'admin'), (req, res) => {
  res.json({
    mensaje: `Hola ${req.usuario.nombre}, accediste como ${req.usuario.rol}`,
    acceso: 'Ruta protegida para fiscalización de mesas'
  });
});

// Ruta protegida solo para admins
router.post('/cargar', verificarToken, permitirRoles('admin'), (req, res) => {
  const datos = req.body;
  res.json({ mensaje: 'Resultados cargados correctamente', datos });
});

module.exports = router;
