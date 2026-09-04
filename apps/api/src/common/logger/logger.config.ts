import { WinstonModuleOptions, utilities } from 'nest-winston';
import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export function createLoggerOptions(): WinstonModuleOptions {
  const format = isProduction
    ? winston.format.json()
    : utilities.format.nestLike('DenTool', {
        colors: true,
        prettyPrint: true,
      });

  return {
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      format,
    ),
    transports: [new winston.transports.Console()],
  };
}
