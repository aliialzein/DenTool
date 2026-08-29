import { Controller, Get } from '@nestjs/common';

import { CacheService } from './cache.service';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('health')
  async health() {
    return {
      redis: await this.cacheService.ping(),
    };
  }
}
