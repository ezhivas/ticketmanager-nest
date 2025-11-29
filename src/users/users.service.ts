
import {Injectable, OnModuleInit, InternalServerErrorException, BadRequestException, NotFoundException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) {}

    async onModuleInit() {
        await this.createDefaultAdmin();
    }
    private async createDefaultAdmin() {
        const adminEmail = this.configService.get<string>('EMAIL'); // Беремо з .env
        const adminPassword = this.configService.get<string>('PASSWORD');
        const adminUsername = this.configService.get<string>('USERNAME') || 'SuperAdmin';

        if (!adminEmail || !adminPassword) {
            return;
        }

        const adminExists = await this.usersRepository.findOneBy({ email: adminEmail });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await this.usersRepository.save({
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true, // Адмін одразу верифікований
            });

            console.log(`👑 Default Admin created: ${adminEmail}`);
            return;
        }
        console.log('Default Admin already exists.');
    }


    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Створюємо юзера
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            isVerified: false,
        });

        const savedUser = await this.usersRepository.save(user);

        // 1h for email verification
        const verificationToken = this.jwtService.sign(
            { id: savedUser.id },
            { expiresIn: '1h' }
        );

        const isSent = await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);

        if (!isSent) {
            // Якщо лист не пішов - можна видалити юзера або кинути помилку,
            // але краще просто попередити клієнта.
            // Для повної транзакційності можна використовувати QueryRunner, але поки спростимо.
            //throw new InternalServerErrorException('User created but failed to send email');
        }

        return {
            message: 'User created. Please check your email.',
            user: savedUser,
        };
    }

    // Get all
    findAll() {
        return this.usersRepository.find();
    }

    // Get one
    async findOne(id: number) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }


    // 4. Update user
    async update(id: number, updateUserDto: UpdateUserDto) {

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.usersRepository.preload({
            id: id,
            ...updateUserDto,
        });

        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.usersRepository.save(updatedUser);
    }

    // Delete user
    async remove(id: number) {
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }

    // Delete all users ('user' role)
    // Todo: check that removes only 'users'
    async removeAll() {

        return this.usersRepository.clear();
    }


    async verifyEmail(token: string) {
        try {
            // Розшифровуємо токен
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.id;

            const user = await this.usersRepository.findOneBy({ id: userId });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            if (user.isVerified) {
                return { message: 'Email already verified' };
            }

            user.isVerified = true;
            await this.usersRepository.save(user);

            return { message: 'Email verified successfully! You can now login.' };

        } catch (error) {
            throw new BadRequestException('Invalid or expired verification token');
        }
    }

    async findOneByEmail(email: string) {
        return this.usersRepository.findOneBy({ email });
    }
}