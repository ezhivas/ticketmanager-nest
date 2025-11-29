import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength} from 'class-validator';
import { TicketPriority, TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(10000)
    description: string;

    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;

    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;
}