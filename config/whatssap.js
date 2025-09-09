import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleMessage } from '../handlers/messages.js';

const { Client, LocalAuth } = pkg;

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "bot-principal" })
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('ready', () => console.log('🤖 Bot listo y conectado a WhatsApp'));

client.on('message', message => handleMessage(client, message));

export function initWhatsAppClient() {
    client.initialize();
}
