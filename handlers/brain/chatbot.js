import { brainData, train, loadBrain } from './brain.js';
import { normalize, similarity } from './utils.js';
import { detectIntent } from './intent.js';
import { searchWikipedia } from './wikipedia.js'; // suponemos que devuelve texto completo

// 🔹 Extraer edad de un texto de Wikipedia
function extractAgeFromWiki(wikiText) {
  const birthRegex = /(\d{1,2})\sde\s(\w+)\sde\s(\d{4})/i;
  const match = wikiText.match(birthRegex);
  if(match){
    const year = parseInt(match[3],10);
    const now = new Date();
    let age = now.getFullYear() - year;
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const birthMonth = months.indexOf(match[2].toLowerCase());
    const birthDay = parseInt(match[1],10);
    if(birthMonth > now.getMonth() || (birthMonth === now.getMonth() && birthDay > now.getDate())){
      age--;
    }
    return age;
  }
  return null;
}

// 🔹 Extraer resumen simple (primera oración) de Wikipedia
function extractSummary(text){
  if(!text) return null;
  const sentences = text.split(/[\.\!\?]\s/);
  return sentences.length > 0 ? sentences[0] : text;
}

// 🔹 Detectar mensaje emocional o afectivo
function detectEmotion(text){
  const emotWords = ["amo","amor","te quiero","feliz","triste","me gusta","odio","enojado","enojada"];
  const normalized = normalize(text);
  return emotWords.some(word => normalized.includes(word));
}

// 🔹 Detectar si es pregunta de “quién es” o “qué es”
function detectEntityQuestion(text){
  const who = /quien\s+es\s+([\w\s]+)/i.exec(text);
  if(who) return { type: "who", subject: who[1].trim() };
  const what = /qué\s+es\s+([\w\s]+)/i.exec(text);
  if(what) return { type: "what", subject: what[1].trim() };
  return null;
}

// 🔹 Detectar si es pregunta de edad
function detectAgeQuestion(text){
  const ageMatch = /cu(á|a)ntos?\s+años\s+tiene\s+([\w\s]+)/i.exec(text);
  if(ageMatch) return ageMatch[2].trim();
  return null;
}

export async function getResponse(text){
  console.log("📩 Mensaje recibido:", text);
  const intent = detectIntent(text);
  const normalized = normalize(text);

  // 🔹 Resolver cálculos simples
  const sanitized = text.replace(/[^0-9+\-*/x%]/g,'');
  const mathMatch = sanitized.match(/(\d+)([+\-*/x%])(\d+)/);
  if(mathMatch){
    const num1 = parseFloat(mathMatch[1]);
    const operator = mathMatch[2];
    const num2 = parseFloat(mathMatch[3]);
    let result;
    switch(operator){
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '*': case 'x': result = num1 * num2; break;
      case '/': result = num2!==0? num1/num2:"No se puede dividir entre 0"; break;
      case '%': result = num1 % num2; break;
      default: result="Operación no reconocida";
    }
    const response = `El resultado es: ${result}`;
    train(text,response,"matematicas","calculo");
    return response;
  }

  // 🔹 Pregunta de edad
  const agePerson = detectAgeQuestion(text);
  if(agePerson){
    const wikiResult = await searchWikipedia(agePerson);
    const age = extractAgeFromWiki(wikiResult);
    if(age !== null){
      const response = `${agePerson} tiene ${age} años. 😄`;
      train(normalize(text), response, "general", intent);
      console.log("✅ Respuesta de edad:", response);
      return response;
    }
  }

  // 🔹 Pregunta de “quién es” o “qué es”
  const entityQuestion = detectEntityQuestion(text);
  if(entityQuestion){
    const wikiResult = await searchWikipedia(entityQuestion.subject);
    const summary = extractSummary(wikiResult); // primera oración o resumen limpio
    if(summary){
      const response = `${entityQuestion.subject}: ${summary}`;
      train(normalize(text), response, "general", intent);
      console.log("✅ Respuesta de entidad:", response);
      return response;
    }
  }

  // 🔹 Mensaje emocional
  if(detectEmotion(text)){
    const emoResponses = ["¡Qué lindo! 😄","¡Me alegro de eso! 😎","Oh, entiendo 😌","¡Gracias por compartirlo! 😊"];
    const response = emoResponses[Math.floor(Math.random()*emoResponses.length)];
    train(normalize(text), response, "general", intent);
    console.log("✅ Respuesta emocional:", response);
    return response;
  }

  // 🔹 Buscar coincidencia en cerebro usando similitud parcial por palabras
  let bestMatch = null;
  let bestScore = 0;
  for(const bloque of brainData){
    for(const pattern of bloque.patrones){
      const normalizedPattern = normalize(pattern);
      const normalizedWords = normalized.split(/\s+/);
      const patternWords = normalizedPattern.split(/\s+/);
      let score = 0;
      normalizedWords.forEach(wordA => {
        let bestWord = 0;
        patternWords.forEach(wordB => {
          const s = similarity(wordA, wordB);
          if(s > bestWord) bestWord = s;
        });
        score += bestWord;
      });
      score /= Math.max(normalizedWords.length, patternWords.length);
      if(score > bestScore){
        bestScore = score;
        bestMatch = bloque;
      }
    }
  }

  if(bestMatch && bestScore >= 0.7){
    const response = bestMatch.respuestas[Math.floor(Math.random()*bestMatch.respuestas.length)];
    console.log("✅ Respuesta (cerebro útil):", response);
    return response;
  }

  // 🔹 Patrón básico de conversación
  const patronesBasicos = ["bien y tu","bien, y tu","bien y tú","bien, y tú","gracias","hola","hey","hi","holi","qué tal"];
  if(patronesBasicos.some(p => normalized.includes(p))){
    const bloqueBasico = brainData.find(b => b.patrones.some(p => normalized.includes(normalize(p))));
    if(bloqueBasico){
      const response = bloqueBasico.respuestas[Math.floor(Math.random()*bloqueBasico.respuestas.length)];
      console.log("✅ Respuesta (cerebro útil) - patrón básico:", response);
      return response;
    }
  }

  // 🔹 Consultar Wikipedia como fallback
  console.log("⚠️ No hay coincidencia confiable, consultando Wikipedia...");
  const wikiResult = await searchWikipedia(text);
  const summary = extractSummary(wikiResult);
  if(summary){
    const response = summary;
    train(normalize(text), response, "general", intent);
    console.log("🔍 Respuesta aprendida y guardada:", response);
    return response;
  }

  // 🔹 Fallback final
  const fallback = "No estoy seguro, ¿puedes explicarme un poco más? 🤔";
  console.log("⚠️ Fallback activado:", fallback);
  return fallback;
}

// 🔹 Cargar cerebro al iniciar
loadBrain();
