import * as winston from "winston";
import { TransformableInfo } from "logform";
import { Chitragupta } from "chitragupta";

interface ChitraguptaOptions {
  level: string;
  message: string;
  meta: any;
}

const jsonLogFormatter = winston.format.printf(
  (info: TransformableInfo): string => {
    const { level, message, ...meta } = info;

    const options: ChitraguptaOptions = {
      level,
      message: message as string,
      meta,
    };

    return Chitragupta.jsonLogFormatter(options);
  },
);

const logger: winston.Logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: jsonLogFormatter,
    }),
  ],
});

export default logger;
