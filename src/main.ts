import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { createUploadthingExpressHandler } from 'uploadthing/express';
import { uploadRouter } from './shared/uploadThing';

const bootstrap = async () => {
  const configService = new ConfigService();

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(configService.get('PORT'));
};
bootstrap();
