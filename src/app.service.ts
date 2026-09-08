import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    return 'Hello World!';
  }

  getDBUrl(): string {
    return this.configService.get<string>('DATABASE_URL') ?? "";
  }
}
