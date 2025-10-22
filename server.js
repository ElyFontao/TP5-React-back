// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// 🔐 CORS para desarrollo local
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174']
}));

// 🧠 Ruta real para resumen provincial (Catamarca)
app.get('/api/nacional', async (req, res) => {
  const {
    anioEleccion,
    tipoRecuento,
    tipoEleccion,
    categoriaId,
    distritoId,
    seccionProvincialId,
    seccionId,
    circuitoId
  } = req.query;

  const url = `https://resultados.mininterior.gob.ar/api/resultados/getResultados`;

  const filtrosBase = {
    anioEleccion,
    tipoRecuento,
    tipoEleccion,
    categoriaId,
    distritoId,
    seccionProvincialId
  };

  const debeTotalizar = !seccionId || seccionId === '0';

  if (debeTotalizar) {
    const seccionesCatamarca = Array.from({ length: 16 }, (_, i) => String(i + 1));

    try {
      const resultados = await Promise.all(
        seccionesCatamarca.map(async (seccionId) => {
          const response = await axios.get(url, {
            params: {
              ...filtrosBase,
              seccionId
            }
          });
          return response.data.estadoRecuento;
        })
      );

      const resumenProvincial = resultados.reduce((acc, curr) => {
        acc.cantidadVotantes += curr.cantidadVotantes || 0;
        acc.mesasTotalizadas += curr.mesasTotalizadas || 0;
        acc.cantidadElectores += curr.cantidadElectores || 0;
        return acc;
      }, {
        cantidadVotantes: 0,
        mesasTotalizadas: 0,
        cantidadElectores: 0
      });

      resumenProvincial.participacionPorcentaje = (
        (resumenProvincial.cantidadVotantes / resumenProvincial.cantidadElectores) * 100
      ).toFixed(2);

      res.json({ estadoRecuento: resumenProvincial });
    } catch (error) {
      console.error('❌ Error al totalizar Catamarca por secciones:', error.message);
      res.status(500).json({ message: 'Error al totalizar Catamarca por secciones', details: error.message });
    }
  } else {
    // Consulta directa por sección o circuito
    const params = {
      ...filtrosBase,
      ...(seccionId && seccionId !== '0' ? { seccionId } : {}),
      ...(circuitoId && circuitoId !== '0' ? { circuitoId } : {})
    };

    try {
      const response = await axios.get(url, { params });
      res.json(response.data);
    } catch (error) {
      console.error('❌ Error al consultar API nacional (directa):', error.message);
      res.status(error.response?.status || 500).json({
        message: 'Error al consultar API nacional (directa)',
        details: error.message
      });
    }
  }
});

// 🧠 Ruta real por mesa (proxy hacia API nacional)
app.get('/api/nacional/mesa', async (req, res) => {
  const {
    anioEleccion,
    tipoRecuento,
    tipoEleccion,
    categoriaId,
    distritoId,
    seccionProvincialId,
    seccionId,
    circuitoId,
    mesaId
  } = req.query;

  const url = `https://resultados.mininterior.gob.ar/api/resultados/getResultados`;

  try {
    const response = await axios.get(url, {
      params: {
        anioEleccion,
        tipoRecuento,
        tipoEleccion,
        categoriaId,
        distritoId,
        seccionProvincialId,
        seccionId,
        circuitoId,
        mesaId
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error al consultar API nacional (mesa):', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Error al consultar API nacional (mesa)',
      details: error.message
    });
  }
});
app.get('/api/comparar/mesa', async (req, res) => {
  const {
    mesaId,
    circuitoId,
    seccionId, // ← sigue disponible para filtros 2023, pero no se usa en el filtro 2025
    distritoId = 3,
    categoriaId = 3,
    tipoRecuento = 1
  } = req.query;

  const filtros2023 = {
    anioEleccion: 2023,
    tipoRecuento,
    tipoEleccion: 2,
    categoriaId,
    distritoId,
    seccionProvincialId: 0,
    seccionId,
    circuitoId,
    mesaId
  };

  try {
    const [res2023, res2025] = await Promise.all([
      axios.get('https://resultados.mininterior.gob.ar/api/resultados/getResultados', { params: filtros2023 }),
      axios.get('https://68d6a769c2a1754b426b7d94.mockapi.io/api/resultados')
    ]);

    // 🔍 Normalizar y filtrar SIN usar seccionId
    const datos2025 = res2025.data.find(item =>
      String(item.mesaId).trim() === String(mesaId).trim() &&
      String(item.circuitoId).padStart(5, '0').trim() === String(circuitoId).padStart(5, '0').trim()
    );

    if (!datos2025 || typeof datos2025.totalVotantes === 'undefined') {
      return res.status(404).json({
        message: `No se encontraron datos simulados válidos para mesaId=${mesaId} y circuitoId=${circuitoId}`
      });
    }

    res.json({
      mesaId,
      circuitoId,
      datos2023: res2023.data.estadoRecuento,
      datos2025
    });
  } catch (error) {
    console.error('❌ Error en comparación por mesa:', error.message);
    res.status(500).json({
      message: 'Error en comparación por mesa',
      details: error.message
    });
  }
});

// 🚀 Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy corriendo en http://localhost:${PORT}`);
});
