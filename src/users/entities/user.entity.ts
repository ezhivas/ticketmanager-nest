import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import {Exclude} from "class-transformer";


@Entity('users') // table name in DB
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ default: 'user' })
    role: string;

    @Column({ default: false })
    isVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


    // Relation with Ticket entity
    // One user can create many tickets
    // @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
    // tickets: Ticket[];
    @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
    tickets: Ticket[];
}