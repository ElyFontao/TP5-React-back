const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido' ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['admin', 'fiscal', 'ciudadano'],
    default: 'ciudadano'
  }
}, {
  timestamps: true // 🕒 createdAt y updatedAt para trazabilidad
});

module.exports = mongoose.model('Usuario', usuarioSchema);
