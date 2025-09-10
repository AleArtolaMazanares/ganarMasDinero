export function detectIntent(text){
  const t = text.toLowerCase().trim();
  const greetings = ["hello","hi","hola","hey","buenos días"];
  if(greetings.some(g => t.startsWith(g))) return "saludo_general";

  const farewells = ["bye","adios","adiós","nos vemos","chao"];
  if(farewells.some(f => t.startsWith(f))) return "despedida";

  if(/[0-9+\-*/x%]/.test(t)) return "calculo";

  if(t.endsWith("?") || /^qué|como|cuándo|dónde|por qué|quién/i.test(t)) return "pregunta";

  if(greetings.some(g => t.startsWith(g)) && t.endsWith("?")) return "saludo_pregunta";

  return "general";
}
