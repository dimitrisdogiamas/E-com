
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS for frontend - handle both development and production
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://nextbuy-frontend.railway.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean); // Remove undefined values

  console.log('CORS origins configured:', allowedOrigins);
  console.log('Environment:', process.env.NODE_ENV);

  // enable cors for the frontend
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any .vercel.app or .railway.app domains in production
      if (process.env.NODE_ENV === 'production' && 
          (origin.endsWith('.vercel.app') || origin.endsWith('.railway.app'))) {
        return callback(null, true);
      }

      // For development, allow any localhost origin
      if (
        process.env.NODE_ENV !== 'production' &&
        (origin.includes('localhost') || origin.includes('127.0.0.1'))
      ) {
        return callback(null, true);
      }

      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200,
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
