import fs from 'fs';
import path from 'path';

const BRAIN_FILE = path.resolve('C:/Users/PC/Desktop/ganarMasDinero/brain.json');
export let brainData = [];

export function loadBrain(){
  brainData = [];
  if(fs.existsSync(BRAIN_FILE)){
    try{
      const savedBrain = JSON.parse(fs.readFileSync(BRAIN_FILE,'utf-8'));
      if(Array.isArray(savedBrain))
        brainData = savedBrain.map(b => ({
          categoria: b.categoria || "general",
          intent: b.intent || "general",
          patrones: b.patrones.map(p => p.toLowerCase()),
          respuestas: b.respuestas
        }));
      console.log("🟢 Cerebro cargado:", brainData.length, "bloques");
    }catch(err){
      console.error("Error cargando brain.json:", err);
      brainData = [];
      saveBrain();
    }
  } else {
    console.log("⚠️ No se encontró brain.json, iniciando vacío");
  }
}

export function saveBrain(){
  try{
    fs.writeFileSync(BRAIN_FILE, JSON.stringify(brainData,null,2));
  }catch(err){console.error("Error guardando brain.json:",err);}
}

export function train(pattern, response, categoria="general", intent="general"){
  const normalized = pattern.toLowerCase();
  let bloque = brainData.find(b => b.categoria === categoria && b.intent === intent);

  if(bloque){
    if(!bloque.patrones.includes(normalized)) bloque.patrones.push(normalized);
    if(response && !bloque.respuestas.includes(response)) bloque.respuestas.push(response);
  } else {
    brainData.push({ categoria, intent, patrones:[normalized], respuestas: response?[response]:[] });
  }

  saveBrain();
  console.log(`📝 Entrenado: "${pattern}" -> "${response}" [${categoria}, ${intent}]`);
}
