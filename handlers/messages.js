import { getResponse, train } from './brain/brain.js';

let pendingPattern = null; // Guarda patrón desconocido temporal

export function handleMessage(client, message) {
  const text = message.body.trim();
  let respuesta = getResponse(text);

  if (respuesta) {
    // Responder normalmente
    message.reply(respuesta);
    console.log("Respuesta enviada:", respuesta);
    pendingPattern = null; // ya no hay patrón pendiente

  } else if (pendingPattern) {
    // Si hay un patrón pendiente, usar este mensaje como respuesta
    train(pendingPattern, text);
    message.reply(`¡Gracias! He aprendido a responder a eso 😁`);
    console.log(`Aprendido: "${pendingPattern}" -> "${text}"`);
    pendingPattern = null;

  } else {
    // No conoce el patrón, pedimos al usuario que enseñe
    message.reply("No sé cómo responder a eso, ¿qué debería decir?");
    console.log(`Patrón desconocido: "${text}"`);
    pendingPattern = text; // Guardamos para el siguiente mensaje
  }
}
