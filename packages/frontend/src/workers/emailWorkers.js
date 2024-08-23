const { parentPort, workerData } = require('worker_threads');
const nodemailer = require('nodemailer');

async function sendEmail(emailOptions) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SSL === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        await transporter.sendMail(emailOptions);
        parentPort.postMessage('Email sent successfully');
    } catch (error) {
        parentPort.postMessage(`Failed to send email: ${error.message}`);
    }
}

sendEmail(workerData);