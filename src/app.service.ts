import { BaseResponseDto } from '@/common/dto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHealth(): BaseResponseDto<{
    status: string;
    environment: string;
    port: number;
  }> {
    const environment =
      this.configService.get<string>('app.env') ?? 'development';
    const port = this.configService.get<number>('app.port') ?? 3000;

    return BaseResponseDto.ok(
      {
        status: 'ok',
        environment,
        port,
      },
      'Service is healthy',
    );
  }
}
