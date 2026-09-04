import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { createLoggerOptions } from './logger.config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(createLoggerOptions())],
  exports: [WinstonModule],
})
export class LoggerModule {}
