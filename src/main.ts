import {NestFactory, Reflector} from '@nestjs/core';
import { AppModule } from './app.module';
import {ClassSerializerInterceptor, ValidationPipe} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // delete unknown fields
        forbidNonWhitelisted: true, // throw error on unknown fields
    }));

    const config = new DocumentBuilder()
        .setTitle('Ticket Manager API')
        .setDescription('API for managing tickets and users')
        .setVersion('1.0')
        .addBearerAuth() // Додає кнопку "Authorize" для JWT токена
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
