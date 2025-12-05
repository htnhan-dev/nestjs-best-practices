import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';

import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';

async function generate() {
  // Create app context
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Swagger config - keep in sync with src/main.ts
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Unified CRM API')
    .setDescription(
      `
###  Welcome to the API Docs
Here is an overview of how the API works:

- Authentication: Bearer token
- Pagination: page, limit
- Errors: 400 | 404 | 409 | 500
  `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  try {
    mkdirSync(join(process.cwd(), 'public', 'docs'), { recursive: true });
    writeFileSync(
      join(process.cwd(), 'public', 'docs', 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
    console.log('openapi.json generated');
  } catch (err) {
    console.warn('Failed to write openapi.json:', err);
    process.exit(1);
  }

  // close application
  await app.close();
  process.exit(0);
}

void generate();
