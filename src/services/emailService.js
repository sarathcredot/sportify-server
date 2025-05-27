



const nodemailer = require("nodemailer");

// Create a transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,                 // Your Gmail address
        pass: process.env.EMAIL_PASSWORD,       // App password from Google
    },
});


module.exports = {
    sendEmail: async (to, subject, text) => {
        return new Promise(async (resolve, reject) => {
            const mailOptions = {
                from: process.env.EMAIL,
                to,
                subject,
                text,
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