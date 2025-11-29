import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

describe('UsersService', () => {
    let service: UsersService;

    const mockUsersRepository = {
        create: jest.fn().mockImplementation((dto) => dto),
        save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 1, ...user })),
        findOneBy: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock_token'),
    };

    const mockEmailService = {
        sendVerificationEmail: jest.fn().mockResolvedValue(true),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'EMAIL') return 'admin@test.com'; // Для onModuleInit
            return null;
        }),
    };


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                // Замінюємо реальні залежності на моки
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });


    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a new user', async () => {
        const dto = { username: 'testuser', email: 'test@example.com', password: 'password123' };


        const result = await service.create(dto);

        // Перевіряємо результат
        expect(result).toEqual({
            message: expect.any(String),
            user: expect.objectContaining({
                id: 1,
                username: dto.username,
                email: dto.email
            })
        });


        expect(mockUsersRepository.create).toHaveBeenCalled();
        expect(mockUsersRepository.save).toHaveBeenCalled();
        expect(mockJwtService.sign).toHaveBeenCalled(); // Токен згенеровано?
        expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled(); // Лист відправлено?
    });
});