import nodemailer from 'nodemailer';
import { emailTemplateService, EmailTemplateData } from './emailTemplateService';

export interface EmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: EmailTemplateData;
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SSL === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        const { to, subject, templateName, templateData } = options;
        const html = emailTemplateService.renderTemplate(templateName, templateData);

        const emailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject,
            html,
        };

        return new Promise((resolve, reject) => {
            setImmediate(async () => {
                try {
                    await this.transporter.sendMail(emailOptions);
                    console.log('Email sent successfully');
                    resolve();
                } catch (error) {
                    console.error('Failed to send email:', error);
                    reject(error);
                }
            });
        });
    }
}

export const emailService = new EmailService();