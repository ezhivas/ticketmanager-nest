import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
    let service: EmailService;

    // 1. Створюємо фейковий ConfigService
    const mockConfigService = {
        get: jest.fn((key: string) => {
            // Повертаємо фейкові значення, щоб тест не падав
            if (key === 'SENDGRID_API_KEY') return 'SG.fake_key';
            if (key === 'SMTP_FROM') return 'test@example.com';
            if (key === 'BASE_URL') return 'http://localhost:3000';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                // 2. Підсовуємо фейк замість реального сервісу
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});