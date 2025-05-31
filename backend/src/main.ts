import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configure CORS with environment-based origins
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://frontend-neighborhood-shops-project-production.up.railway.app',
        ]
      : [
          'http://localhost:3000',
          'https://frontend-neighborhood-shops-project-production.up.railway.app',
        ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Neighborhood Shops RESTFul API')
    .setDescription('Neighborhood Shops Endpoints')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const PORT = process.env.PORT;

  await app.listen(PORT || 3000);

  const logger = new Logger('Consolita'); // O el nombre que prefieras

  if (PORT == '3000') {
    logger.log(`Server running on port localhost:${process.env.PORT_TEST}`);
  } else {
    logger.log(`Server running on port ${PORT}`);
  }
}
bootstrap();
