import fs from 'fs';
import path from 'path';
import { render } from '@/utils/templateEngine';

export interface EmailTemplateData {
    [key: string]: any;
}

export class EmailTemplateService {
    private templates: { [key: string]: string } = {};

    constructor() {
        this.loadTemplates();
    }

    private loadTemplates() {
        const templatesDir = path.join(process.cwd(), 'src', 'emailTemplates');
        fs.readdirSync(templatesDir).forEach(file => {
            if (file.endsWith('.html')) {
                const templateName = path.basename(file, '.html');
                const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
                this.templates[templateName] = templateContent;
            }
        });
    }

    renderTemplate(templateName: string, data: EmailTemplateData): string {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }
        return render(template, data);
    }
}

export const emailTemplateService = new EmailTemplateService();