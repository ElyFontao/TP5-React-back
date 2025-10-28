const fs = require('fs');
const csv = require('csv-parser');

const mesasCatamarca = new Map();

fs.createReadStream('mesas2.csv') // o mesas2.csv
  .pipe(csv())
  .on('data', (row) => {
    if (row.distrito_id !== '3') return;

    const key = `${row.mesa_id}-${row.circuito_id}-${row.seccion_id}`;
    if (!mesasCatamarca.has(key)) {
      mesasCatamarca.set(key, {
        mesaId: row.mesa_id,
        circuitoId: row.circuito_id,
        seccionId: row.seccion_id,
        localidad: row.circuito_nombre,
        cantidadElectores: parseInt(row.mesa_electores, 10)
      });
    }
  })
  .on('end', () => {
    const resultado = Array.from(mesasCatamarca.values());
    fs.writeFileSync('mesas2.json', JSON.stringify(resultado, null, 2)); // o mesas2.json
    console.log(`✅ Archivo convertido con ${resultado.length} mesas únicas`);
  });
