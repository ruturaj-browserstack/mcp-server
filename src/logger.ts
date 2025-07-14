import { pino } from "pino";
import config from "./config.js";
import chitraguptaLogger from "./lib/chitragupta-logger/logger.js";

let logger: any;

console.log("Logger initialized with config:");
console.log(config.REMOTE_MCP);

if (config.REMOTE_MCP) {
  logger = chitraguptaLogger;
} else if (process.env.NODE_ENV === "development") {
  logger = pino({
    level: "debug",
    transport: {
      targets: [
        {
          level: "debug",
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: true,
            destination:
              process.platform === "win32"
                ? "C:\\Windows\\Temp\\browserstack-mcp-server.log"
                : "/tmp/browserstack-mcp-server.log",
          },
        },
      ],
    },
  });
} else {
  // NULL logger
  logger = pino({
    level: "info",
    transport: {
      target: "pino/file",
      options: {
        destination: process.platform === "win32" ? "NUL" : "/dev/null",
      },
    },
  });
}

export default logger;
