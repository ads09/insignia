import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentVariables } from './config/env.validation.js';
import { DomainErrorFilter } from './shared/presentation/domain-error.filter.js';

/** Application-wide wiring shared by the server bootstrap and the e2e tests. */
export function setupApp(app: INestApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.enableCors({
    origin: config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new DomainErrorFilter());
  app.enableShutdownHooks();
}

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Insignia Crypto Wallet API')
      .setDescription(
        'Endpoints of the assignment specification plus the extensions required by the admin dashboard.',
      )
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'User token, optionally prefixed with "Bearer ".',
        },
        'token',
      )
      .build(),
  );
  SwaggerModule.setup('docs', app, document);
}
