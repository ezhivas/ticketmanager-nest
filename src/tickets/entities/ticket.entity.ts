import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TicketStatus {
    NEW = 'new',
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    CLOSED = 'closed',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('tickets') // table name in DB
export class Ticket {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'simple-enum',
        enum: TicketStatus,
        default: TicketStatus.NEW,
    })
    status: TicketStatus;

    @Column({
        type: 'simple-enum',
        enum: TicketPriority,
        default: TicketPriority.LOW,
    })
    priority: TicketPriority;

    @ManyToOne(() => User, (user) => user.tickets, { eager: true }) // eager: true means to load the user data automatically
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ nullable: true })
    createdById: number;

    @Column({ nullable: true })
    lastUpdatedBy: string;

    @Column('simple-json', { nullable: true })
    previousState: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}