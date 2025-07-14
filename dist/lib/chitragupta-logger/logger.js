import * as winston from "winston";
import { Chitragupta } from "chitragupta";
const jsonLogFormatter = winston.format.printf((info) => {
    const { level, message, ...meta } = info;
    const options = {
        level,
        message: message,
        meta,
    };
    return Chitragupta.jsonLogFormatter(options);
});
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: jsonLogFormatter,
        }),
    ],
});
export default logger;
