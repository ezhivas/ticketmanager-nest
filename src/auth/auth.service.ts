import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(email: string, pass: string) {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('No user with this email');
        }

        if (!user.isVerified) {
            // Todo; uncomment when email verification is implemented
            // throw new UnauthorizedException('Please verify your email first');
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const payload = { id: user.id, email: user.email, role: user.role };

        return {
            message: 'Login successful',
            token: await this.jwtService.signAsync(payload),
            user: { id: user.id, email: user.email, role: user.role },
        };
    }
}