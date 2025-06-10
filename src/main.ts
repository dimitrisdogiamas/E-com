import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS for frontend - handle both development and production
  const corsOrigins =
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL, 'https://nextbuy-frontend.railway.app']
      : ['http://localhost:3000'];

  // enable cors for the frontend
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Use PORT environment variable or default to 4001
  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`🚀 NextBuy Backend running on http://localhost:${port}`);
  console.log('📁 Static files served from /uploads/');
}
bootstrap();
