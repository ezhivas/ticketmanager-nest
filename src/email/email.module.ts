import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config'; // ConfigModule потрібен для сервісу

@Module({
    imports: [ConfigModule],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}