import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';

describe('TicketsService', () => {
    let service: TicketsService;

    // Мок для репозиторію та QueryBuilder
    const mockTicketsRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        preload: jest.fn(),
        remove: jest.fn(),
        // Мокаємо QueryBuilder для пагінації
        createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[], 0]), // Повертає порожній масив і 0
        })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsService,
                {
                    provide: getRepositoryToken(Ticket), // Вказуємо токен репозиторію
                    useValue: mockTicketsRepository,
                },
            ],
        }).compile();

        service = module.get<TicketsService>(TicketsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});