// server.js (Servidor Proxy con Datos Simulados)
const express = require('express');
const cors = require('cors'); 

const app = express();
const PORT = 3001; // Puerto para el servidor proxy

// 1. Configuración de CORS
// 🚨 CORRECCIÓN: Se agrega http://localhost:5174 al array de orígenes permitidos
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'] 
}));

// 2. Ruta Proxy: /api/nacional
// Actúa como un Mocking Proxy, devolviendo un JSON fijo.
app.get('/api/nacional', async (req, res) => {
    
    // 🚨 3. JSON de datos SIMULADOS (Mock)
    const mockData = {
        "fechaTotalizacion": "2019-08-12T10:00:00.000Z", 
        "estadoRecuento": {
            "mesasEsperadas": 100000,
            "mesasTotalizadas": 98500,
            "mesasTotalizadasPorcentaje": 98.50,
            "cantidadElectores": 33800000,
            "cantidadVotantes": 25500000, // <--- TotalVotos
            "participacionPorcentaje": 75.44 // <--- Participación
        },
        "valoresTotalizadosPositivos": [],
        "valoresTotalizadosOtros": {}
    };

    try {
        console.log('Devolviendo datos simulados a React...');
        
        // Simular un pequeño retraso
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        // 4. Devolver los datos simulados
        res.json(mockData);

    } catch (error) {
        console.error('Error en el servidor de simulación:', error.message);
        res.status(500).json({ 
            message: 'Error en el servidor de simulación.', 
            details: error.message 
        });
    }
});

// 5. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor proxy (MOCK) corriendo en http://localhost:${PORT}`);
});