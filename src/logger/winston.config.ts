import * as winston from 'winston';
import * as path from 'path';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';

const logDir = path.join(process.cwd(), 'logs');

const requestIdFormat = winston.format((info) => {
  if (info.requestId) {
    info.message = `[${info.requestId}] ${info.message}`;
  }
  return info;
});

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.ms(),
        requestIdFormat(),
        nestWinstonModuleUtilities.format.nestLike('NestApp', {
          colors: true,
          prettyPrint: true,
          processId: false,
          appName: true,
        }),
      ),
    }),

    new winston.transports.File({
      level: 'error',
      filename: path.join(logDir, 'error.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      maxsize: 5242880,
      maxFiles: 5,
    }),

    new winston.transports.File({
      level: 'info',
      filename: path.join(logDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  ],

  exitOnError: false,
};
