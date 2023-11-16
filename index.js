const express = require("express");
const app = express();
const qrcode = require('qrcode-terminal');
const Tesseract = require("tesseract.js");
const fs = require('fs');
const sharp = require('sharp');
const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const SESSION_FILE_PATH = './session.json';
const client = new Client({
    authStrategy: new LocalAuth()
});
try {


    function chat() {
        client.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
            console.log('Client is ready!');
            client.getChats().then(async (chats) => {
                const chaty = chats.find((chat) => chat.name === "Diksha Chor");
                client.sendMessage(chaty.id._serialized, "hello i am a bot");
            })
        });
        // Save session values to the file upon successful auth
        client.on('authenticated', (session) => {
            sessionData = session;
            console.log(session, "session");
        });

        client.on('message', message => {
            console.log(message, "message")
            if (message.body === "Hi") {
                // client.sendMessage(message.id.remote, "Yo whatsupp")
                Input: [{ id: 'customId', body: 'button1' }, { body: 'button2' }, { body: 'button3' }, { body: 'button4' }]

                const inputArray = [
                    { body: 'Button 1', id: 'button1' },
                    { body: 'Button 2', id: 'button2' },
                    { body: 'Button 3', id: 'button3' }
                ];

                const buttonMessage = new Buttons(
                    'Button message text',
                    inputArray,
                    'Button message title',
                    'Button message footer'
                )._format(inputArray);

                client.sendMessage(message.id.remote, buttonMessage);
            }
            if (message.type === "image") {
                message.downloadMedia().then((val) => {
                    console.log(val, "val")
                    const imageData = val.data;
                    const imageBuffer = Buffer.from(imageData, 'base64');

                    // Specify the file path where you want to save the image
                    // const filePath = __dirname + '/image.jpg'; // Change this to your desired file path with the correct extension
                    sharp(imageBuffer)
                        .toFormat('png')  // Convert to PNG format
                        .toBuffer()       // Get the resulting buffer
                        .then((pngBuffer) => {
                            // Write the converted buffer to a new file or use it as needed
                            Tesseract.recognize(
                                pngBuffer,
                                'eng',
                            ).then(({ data: { text } }) => {
                                console.log(text);
                                const cleanedText = text.replace(/[^\w\s]/gi, '');

                                // Replace multiple line breaks with a single line break
                                const finalText = cleanedText.replace(/\n{2,}/g, '\n');
                                client.sendMessage(message.id.remote, cleanedText);
                            })
                        })
                        .catch((err) => {
                            console.error('Error converting image:', err);
                        });

                    // Write the image buffer to a file
                    // fs.writeFile(filePath, imageBuffer, (err) => {
                    //     if (err) {
                    //         console.error('Error saving the image:', err);
                    //         return;
                    //     }
                    //     console.log('Image saved successfully.');
                    // });
                })
            }
        });

        client.initialize();
    }
    chat();
} catch (error) {
    console.log(error, "error");
}
app.listen(5000, () => {
    console.log(`app listening to 5000 port`);
})