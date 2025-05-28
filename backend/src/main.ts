import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configure CORS with environment-based origins
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://frontend-neighborhood-shops-project-production.up.railway.app']
    : [
        'http://localhost:5173',
        'http://localhost:5174', 
        'http://localhost:3000',
        'http://localhost:4173',
        'https://frontend-neighborhood-shops-project-production.up.railway.app'
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

  const PORT = process.env.PORT

  await app.listen( PORT || 3000);
  
  if(PORT == "3000"){
    console.log(`Server running on port localhost:${process.env.PORT_TEST}`);
  }
  else{
    console.log(`Server running on port ${PORT}`);
  }
  
}
bootstrap();