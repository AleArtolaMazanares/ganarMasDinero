import fs from 'fs';
import path from 'path';

const BRAIN_FILE = path.resolve('C:/Users/PC/Desktop/ganarMasDinero/brain.json');
let brainData = [];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function loadBrain() {
  brainData = [];
  if (!fs.existsSync(BRAIN_FILE)) {
    brainData = [
      { patrones: ["hola"], respuestas: ["Hola", "¡Hey!"] },
      { patrones: ["como estas"], respuestas: ["Bien, ¿y tú?", "Todo bien, gracias"] },
      { patrones: ["bien", "bien y tu"], respuestas: ["Me alegro", "Genial"] },
    ];
    saveBrain();
    return;
  }

  try {
    const savedBrain = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf-8'));
    if (Array.isArray(savedBrain)) {
      brainData = savedBrain.map(b => ({
        patrones: b.patrones.map(p => normalize(p)),
        respuestas: b.respuestas
      }));
    } else {
      saveBrain();
    }
  } catch {
    saveBrain();
  }
}

export function saveBrain() {
  try {
    fs.writeFileSync(BRAIN_FILE, JSON.stringify(brainData, null, 2));
  } catch (err) {
    console.error("Error guardando brain.json:", err);
  }
}

export function getResponse(text) {
  const normalizedText = normalize(text);
  for (const bloque of brainData) {
    if (bloque.patrones.some(p => normalizedText.includes(p))) {
      return bloque.respuestas[Math.floor(Math.random() * bloque.respuestas.length)];
    }
  }
  return null;
}

export function train(pattern, response) {
  const normalizedPattern = normalize(pattern);

  let bloque = brainData.find(b => b.patrones.some(p => normalizedPattern.includes(p) || p.includes(normalizedPattern)));

  if (bloque) {
    if (response && !bloque.respuestas.includes(response)) {
      bloque.respuestas.push(response);
    }
    if (!bloque.patrones.includes(normalizedPattern)) {
      bloque.patrones.push(normalizedPattern);
    }
  } else {
    brainData.push({
      patrones: [normalizedPattern],
      respuestas: response ? [response] : []
    });
  }

  saveBrain();
}

loadBrain();
