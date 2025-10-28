const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('./models/Usuario');

// 🌐 Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://Sistemas_01:Sistemas_01@oficina.5nq1scq.mongodb.net/eleccionesDB?retryWrites=true&w=majority');

mongoose.connection.once('open', async () => {
  try {
    console.log('✅ Conectado a MongoDB Atlas');

    // 🧹 Eliminar usuarios existentes
    await Usuario.deleteMany({});

    // 🔐 Hashear contraseñas
    const adminPassword = await bcrypt.hash('admin123', 10);
    const fiscalPassword = await bcrypt.hash('fiscal123', 10);

    // 👥 Usuarios a insertar
    const usuarios = [
      {
        nombre: 'Admin General',
        email: 'admin@elecciones.ar',
        password: adminPassword,
        rol: 'admin'
      },
      {
        nombre: 'Fiscal Catamarca',
        email: 'fiscal@elecciones.ar',
        password: fiscalPassword,
        rol: 'fiscal'
      }
    ];

    // 💾 Insertar en la base
    await Usuario.insertMany(usuarios);
    console.log('✅ Usuarios insertados correctamente');
  } catch (error) {
    console.error('❌ Error al insertar usuarios:', error.message);
  } finally {
    mongoose.disconnect();
  }
});
