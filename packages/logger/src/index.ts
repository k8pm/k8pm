import winston from "winston";

const { combine, prettyPrint, colorize } = winston.format;

export type LoggerInstance = winston.Logger;

export class Logger {
  createLogger(service: string) {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || "debug",
      format: combine(
        //timestamp(),
        //colorize(),
        prettyPrint()
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console({
          // format: winston.format.combine(
          //   //winston.format.label({ label: 'MY-SILLY-APP' }),
          //   //winston.format.timestamp(),
          //   winston.format.metadata({
          //     fillExcept: ["message", "level", "timestamp", "label"],
          //   }),
          //   winston.format.colorize(),
          //   winston.format.printf((info) => {
          //     let out = `${info.level}: ${info.message}`;
          //     if (info.metadata) {
          //       out = `${out} ${JSON.stringify(info.metadata, null, 4)}`;
          //     }
          //     return out;
          //   })
          // ),
        }),
      ],
    });
  }
}
