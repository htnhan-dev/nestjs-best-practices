import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponseDto } from '@/common/dto';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let configService: ConfigService;

  beforeEach(async () => {
    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'app.env') {
          return 'test';
        }

        if (key === 'app.port') {
          return 3001;
        }

        return undefined;
      }),
    } satisfies Partial<ConfigService>;

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    configService = app.get<ConfigService>(ConfigService);
  });

  describe('health', () => {
    it('should return a successful health payload', () => {
      const response = appController.getHealth();

      expect(response).toBeInstanceOf(BaseResponseDto);
      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        status: 'ok',
        environment: configService.get('app.env'),
        port: configService.get('app.port'),
      });
    });
  });
});
