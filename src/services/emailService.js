



const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');


// Create a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,                 // Your Gmail address
        pass: process.env.EMAIL_PASSWORD,       // App password from Google
    },
});


const readTemplate = (replacements) => {
    const filePath = path.join("mailtemplate.html");
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(replacements);
    return htmlToSend;
};



module.exports = {
    sendEmail: async (to, subject, mailData) => {
        return new Promise(async (resolve, reject) => {

            const htmlContent = readTemplate(mailData);

            const mailOptions = {
                from: process.env.EMAIL,
                to,
                subject,
                html: htmlContent, // Use the HTML content from the template
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent successfully");
                resolve();
            } catch (error) {
                console.error("Error sending email:", error);
                reject(error);
            }
        });
    },
};