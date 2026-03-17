import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { shouldEnableSwagger } from './shared/docs/swagger-environment';
import { ApiExceptionFilter } from './shared/errors';

const parseCorsOrigins = (rawOrigins: string | undefined): string[] => {
  if (!rawOrigins || rawOrigins.trim().length === 0) {
    return ['http://localhost:4200', 'http://localhost:5173', 'http://localhost:8080'];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isSwaggerEnabled = shouldEnableSwagger(process.env.NODE_ENV);

  app.use(helmet());
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  if (isSwaggerEnabled) {
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
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  if (isSwaggerEnabled) {
    Logger.log(`Swagger docs: http://localhost:${port}/api`);
  } else {
    Logger.log('Swagger docs are disabled in production mode.');
  }
  Logger.log(`CORS origins: ${corsOrigins.join(', ')}`);
}

bootstrap();
