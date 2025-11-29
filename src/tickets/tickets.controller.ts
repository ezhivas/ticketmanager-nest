import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/decorators/user.decorator';
import { User as UserEntity } from '../users/entities/user.entity';
import { Query} from "@nestjs/common";
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
//import { Roles } from '../auth/decorators/roles.decorator';


@Controller('api/tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post()
    create(@Body() createTicketDto: CreateTicketDto, @User() user: UserEntity) {
        return this.ticketsService.create(createTicketDto, user);
    }

    @Get()
    findAll(
        @Query() paginationQuery: PaginationQueryDto, // Забираємо limit/offset в DTO
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('search') search?: string,
    ) {
        return this.ticketsService.findAll(paginationQuery, status, priority, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTicketDto: UpdateTicketDto,
        @User() user: UserEntity
    ) {
        return this.ticketsService.update(+id, updateTicketDto, user.email);
    }

    @Delete(':id')
    @UseGuards(RolesGuard) // only admin can delete
    remove(@Param('id') id: string) {
        return this.ticketsService.remove(+id);
    }
}