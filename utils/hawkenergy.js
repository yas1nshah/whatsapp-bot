const {Client, LocalAuth, MessageMedia, Buttons, Util} = require("whatsapp-web.js")
const qrcode = require('qrcode-terminal');

const u = new Util()
const  register = (id) => {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: id })
    });

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    // Define a sessions object to store session data
    const sessions = {};

    // ! For Incoming Messages
    client.on('message', async (message) => {
        const senderId =  message.from; // Get sender's ID
        const senderName = (await message.getContact()).pushname

        const buttons = new Buttons()
        u.formatImageToWebpSticker()
    

        
    });
        
        
    client.initialize();
     
}


module.exports = register
