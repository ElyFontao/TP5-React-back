const fs = require('fs');

const mesas1 = JSON.parse(fs.readFileSync('./mesas1.json', 'utf8'));
const mesas2 = JSON.parse(fs.readFileSync('./mesas2.json', 'utf8'));

const mapaMesas = new Map();

[...mesas1, ...mesas2].forEach((m) => {
  const key = `${m.mesaId}-${m.circuitoId}-${m.seccionId}`;
  if (!mapaMesas.has(key)) {
    mapaMesas.set(key, m);
  }
});

const resultado = Array.from(mapaMesas.values());
fs.writeFileSync('mesas-catamarca.json', JSON.stringify(resultado, null, 2));
console.log(`✅ Archivo fusionado con ${resultado.length} mesas únicas`);
