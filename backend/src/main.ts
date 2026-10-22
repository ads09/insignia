import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp, setupSwagger } from './app.setup.js';
import { EnvironmentVariables } from './config/env.validation.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  setupSwagger(app);

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  await app.listen(config.get('PORT', { infer: true }));
}

await bootstrap();
