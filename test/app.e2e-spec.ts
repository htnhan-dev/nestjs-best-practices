import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidUnknownValues: true,
      }),
    );

    await app.init();

    // The Nest container resolves the actual ConfigService instance at runtime.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
      },
    });

    expect(response.body.data.environment).toBe(
      configService.get<string>('app.env'),
    );
  });
});
