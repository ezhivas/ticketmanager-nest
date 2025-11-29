import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';


@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketsRepository: Repository<Ticket>,
    ) {}

    async create(createTicketDto: CreateTicketDto, user: User) {
        const ticket = this.ticketsRepository.create({
            ...createTicketDto,
            createdBy: user,
            createdById: user.id,
        });

        return this.ticketsRepository.save(ticket);
    }



        async findAll(paginationQuery: PaginationQueryDto,
                      status?: string,
                      priority?: string,
                      search?: string) {

            const { limit = 10, offset = 0 } = paginationQuery; // Default values

            const query = this.ticketsRepository.createQueryBuilder('ticket')
                .leftJoinAndSelect('ticket.createdBy', 'user')
                .orderBy('ticket.createdAt', 'DESC')
                .take(limit) // LIMIT
                .skip(offset); // OFFSET

            const where: any = {};

            if (status) {
                where.status = status;
            }

            if (priority) {
                where.priority = priority;
            }

            if (status) {
                query.andWhere('ticket.status = :status', { status });
            }

            if (priority) {
                query.andWhere('ticket.priority = :priority', { priority });
            }

            if (search) {
                query.andWhere(
                    '(ticket.title LIKE :search OR ticket.description LIKE :search)',
                    { search: `%${search}%` },
                );
            }

            const [tickets, total] = await query.getManyAndCount();

            return {
                data: tickets,
                total,
                limit,
                offset,
            };
        }

    async findOne(id: number) {
        const ticket = await this.ticketsRepository.findOneBy({ id });
        if (!ticket) {
            throw new NotFoundException(`Ticket #${id} not found`);
        }
        return ticket;
    }

    async update(id: number, updateTicketDto: UpdateTicketDto, userEmail: string) {
        const ticket = await this.findOne(id);

        const historyItem = {
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            updatedBy: ticket.lastUpdatedBy,
            archivedAt: new Date(),
        };

        const currentHistory = ticket.previousState || [];

        const updatedTicketData = await this.ticketsRepository.preload({
            id: id,
            ...updateTicketDto,
            lastUpdatedBy: userEmail,
            previousState: [...currentHistory, historyItem],
        });

        if (!updatedTicketData) {
            throw new NotFoundException(`Ticket #${id} not found`);
        }

        return this.ticketsRepository.save(updatedTicketData);
    }

    async remove(id: number) {
        const ticket = await this.findOne(id);
        return this.ticketsRepository.remove(ticket);
    }
}