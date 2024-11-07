import winston from 'winston';
import { createLogger, format, transports } from 'winston';


export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf((info) =>
            JSON.stringify({
                t: info.timestamp,
                l: info.level,
                m: info.message,
                s: info.splat !== undefined ? `${info.splat}` : '',
            }) + ','
        )
    ),
});

if (process.env.NODE_ENV !== 'PRODUCTION') {
    logger.add(new transports.Console({ format: winston.format.cli(), level: 'info'}));
    //logger.add(new transports.Console({ format: winston.format.cli() }, error));
    // Turn these on to create logs as if it were production
     logger.add(new transports.File({ filename: 'log/error.log', level: 'error', maxsize:5000000, maxFiles: 5 }));
     logger.add(new transports.File({ filename: 'log/warn.log', level: 'warn', maxsize:5000000, maxFiles: 5 }));
     logger.add(new transports.File({ filename: 'log/info.log', level: 'info', maxsize:5000000, maxFiles: 5 }));
     logger.add(new transports.File({ filename: 'log/debug.log', level: 'debug', maxsize:5000000, maxFiles: 5 }));
     logger.add(new transports.File({ filename: 'log/combined.log', maxsize:5000000, maxFiles: 10}));
}