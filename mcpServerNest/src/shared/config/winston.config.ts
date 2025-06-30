import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export function createWinstonConfig(): WinstonModuleOptions {
  const logLevel = process.env.LOG_LEVEL || 'info';

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ],
  };
} 