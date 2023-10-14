import winston, { createLogger, format } from "winston";

export type LoggerInstance = winston.Logger;

const customFormat = format.printf(
  ({ level, message, logSource, ...metadata }) => {
    if (level === "info") {
      return `[${logSource}]: ${message}`;
    }

    let msg = `[${level}] [${logSource}]: ${message} `;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ignore
    if (metadata) {
      msg += JSON.stringify(metadata, null, 2);
    }
    return msg;
  }
);

export class Logger {
  createLogger(logSource: string) {
    return createLogger({
      level: process.env.LOG_LEVEL || "debug",
      format: format.combine(format.colorize(), format.splat(), customFormat),
      defaultMeta: { logSource },
      transports: [new winston.transports.Console()],
    });
  }
}
