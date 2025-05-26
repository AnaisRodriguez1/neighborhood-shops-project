import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://frontend-neighborhood-shops-project-production.up.railway.app',
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