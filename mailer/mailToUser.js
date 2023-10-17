require('dotenv').config();

const nodemailer = require("nodemailer");

async function sendMailToUser(token, mailOptions){
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });

        let details = await transporter.sendMailToUser(mailOptions);
        console.log("Message sent: %s", details.messageId);

    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = sendMailToUser;