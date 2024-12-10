import winston, { format } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const { printf, combine, timestamp, colorize, json, prettyPrint } = format
const config = useRuntimeConfig()

const path = "logs/"

const rootLogger = winston.createLogger({
  // emerg: 0,
  // alert: 1,
  // crit: 2,
  // error: 3,
  // warning: 4,
  // notice: 5,
  // info: 6,
  // debug: 7
  levels: winston.config.syslog.levels,
  level: config.logLevel,
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [

    new DailyRotateFile({
      filename: path + "logfile-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      // zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),

    new winston.transports.Console({
      format: combine(
        format(
          (info, _) => info,
        )(),
        colorize(),
        printf(({ level, message, label, timestamp, ...meta }) => {
          return `${level}${typeof label == "undefined" ? "" : ` ${label}`}: ${message} ${JSON.stringify(meta)}`
        }),
      ),
    }),

  ],
})

// only log to terminal in development
if (process.env.NODE_ENV === "development") {
  rootLogger.add(new winston.transports.File({
    filename: path + "json-filtered.log",
    format: combine(
      format(
        (info, _) => info.label !== "db" ? info : false,
      )(),
      timestamp(),
      prettyPrint(),
    ),
  }))
  rootLogger.add(new winston.transports.File({
    filename: path + "human-filtered.log",
    format: combine(
      format(
        (info, _) => info.label !== "db" ? info : false,
      )(),
      timestamp({ format: "HH:mm:ss" }),
      printf(({ level, message, timestamp, label }) => {
        return `[${timestamp}] ${level}${typeof label == "undefined" ? "" : ` ${label}`}: ${message}`
      }),
    ),
  }))
}

/** logger with label main */
export const logger = rootLogger.child({ label: "main" })
/** logger with label db */
export const dbLogger = rootLogger.child({ label: "db" })
/** logger with label auth */
export const authLogger = rootLogger.child({ label: "auth" })
export default rootLogger
