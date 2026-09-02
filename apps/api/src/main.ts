import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );
  app.useWebSocketAdapter(redisIoAdapter);
  // Allow the Next.js frontend (localhost:3000) to call this API.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators.
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present.
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes.}
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
void bootstrap();
