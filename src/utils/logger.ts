import winston from 'winston';
import { config as configEnv } from '../config/index.js';

let logger: winston.Logger | undefined;

const config = configEnv.logger;

const textFormat = winston.format.combine(
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(), // Adds colors to console logs
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

export const createLogger = (): winston.Logger => {
    if (logger) return logger;
    logger = winston.createLogger({
        level: config.level,
        format: config.format === 'json' ? winston.format.json() : textFormat,
        transports: [new winston.transports.Console()],
    });
    return logger;
};
