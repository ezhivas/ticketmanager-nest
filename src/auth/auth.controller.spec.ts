import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;

    // 1. Створюємо мок для сервісу
    const mockAuthService = {
        signIn: jest.fn(() => {
            return {
                access_token: 'mock_token',
            };
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                // 2. Підміняємо реальний сервіс на мок
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // Можна додати простий тест
    it('should return a token on login', async () => {
        const result = await controller.signIn({ email: 'test@test.com', password: 'pass' });
        expect(result).toEqual({ access_token: 'mock_token' });
        expect(mockAuthService.signIn).toHaveBeenCalled();
    });
});