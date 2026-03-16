import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription(
      'REST API for authentication, employee management, and task management with subtasks.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('health', 'Operational health checks for monitoring and uptime probes.')
    .addTag('auth', 'Authentication endpoints for user registration and login.')
    .addTag('employees', 'CRUD endpoints to manage employees.')
    .addTag('tasks', 'CRUD endpoints to manage tasks and subtasks.')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  Logger.log(`Swagger docs: http://localhost:${port}/api`);
}

bootstrap();
