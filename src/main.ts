import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import fastifyMultipart from '@fastify/multipart';
import { join } from 'path';
import fastifyStatic from '@fastify/static';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  //Enable Cors 
  app.enableCors();
  //Register Multipart
  app.register(fastifyMultipart);
  // Serve static files from the 'uploads' directory
  app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  });
  // Validation using Zod
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
