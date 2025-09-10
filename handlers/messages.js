import { getResponse } from './brain/chatbot.js';

export async function handleMessage(client, message){
  try{
    const response=await getResponse(message.body);
    await message.reply(response);
  }catch(err){
    console.error("Error procesando mensaje:",err);
    await message.reply("Ups 😅, algo salió mal al procesar tu mensaje.");
  }
}
