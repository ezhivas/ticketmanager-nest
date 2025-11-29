import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
        if (apiKey) {
            sgMail.setApiKey(apiKey);
        } else {
            this.logger.error('SENDGRID_API_KEY is not defined in .env');
        }
    }

    async sendVerificationEmail(to: string, token: string): Promise<boolean> {
        const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
        const link = `${baseUrl}/api/users/verify-email?token=${token}`;
        console.log(link);

        const msg = {
            to,
            from: this.configService.get<string>('SMTP_FROM')!, // Твій верифікований email у SendGrid
            subject: 'Verify your email for Ticket Manager',
            html: `
        <h1>Welcome!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${link}">Verify Email</a>
        <p>Or copy this link: ${link}</p>
      `,
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Verification email sent to ${to}`);
            return true;
        } catch (error) {
            this.logger.error('Error sending email:', error);
            if (error.response) {
                this.logger.error(error.response.body);
            }
            return false;
        }
    }
}
