const express = require("express");
const app = express();
const qrcode = require('qrcode-terminal');
const Tesseract = require("tesseract.js");
const fs = require('fs');
const sharp = require('sharp');
const PDFParser = require('pdf-parse');
const { Document, Packer, Paragraph } = require('docx');
const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
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
                const chaty = chats.find((chat) => chat.name === "WhatsApp Himanshu");
                client.sendMessage(chaty.id._serialized, "hello i am a bot");
            })
        });
        // Save session values to the file upon successful auth
        client.on('authenticated', (session) => {
            sessionData = session;
            console.log(session, "session");
        });

        client.on('message', async message => {
            console.log(message, "message")

            if (message.hasMedia) {

                const media = await message.downloadMedia();
                console.log(media, "Media");
                const pdfData = Buffer.from(media.data, "base64");
                const filePath = __dirname + (`/pdf/${Math.random() * 100}file.pdf`);
                const docxFilePath = __dirname + (`/pdf/${Math.random() * 1000}file.docx`);
                fs.writeFile(filePath, pdfData, 'binary', (err) => {
                    if (err) {
                        console.error('Error saving PDF file:', err);
                    } else {
                        console.log('PDF file saved successfully.');
                        fs.readFile(filePath, async (err, data) => {
                            if (err) {
                                console.error("error", err);
                            } else {
                                const pdfData = await PDFParser(data);
                                console.log("11111")
                                // Extracted text from the PDF
                                const textFromPDF = pdfData.text;
                                console.log("11111")
                                const doc = new Document({
                                  sections:[{
                                    properties: {},
                                    children: [new Paragraph(textFromPDF)]
                                  }]
                                  });
                                console.log("11111")
                             
                                console.log("11111")
                                Packer.toBuffer(doc).then((buffer) => {
                                    fs.writeFile(docxFilePath, buffer, (writeErr) => {
                                        if (writeErr) {
                                            console.error('Error saving the DOCX file:', writeErr);
                                        } else {
                                            console.log('PDF content written to DOCX file successfully.');
                                            const media = MessageMedia.fromFilePath(docxFilePath);
                                            client.sendMessage(message.id.remote, media);
                                        }
                                    });
                                });
                            }
                        })
                    }
                });
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