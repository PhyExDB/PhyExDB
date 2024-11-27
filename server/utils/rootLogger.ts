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

    // new winston.transports.File({
    //   filename: path + "logfile.log",
    // }),

    new DailyRotateFile({
      filename: path + "logfile-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      // zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),

  ],
})

// only log to terminal in development
if (process.env.NODE_ENV === "development") {
  rootLogger.add(new winston.transports.Console({
    format: combine(
      format(
        (info, _) => info,
      )(),
      colorize(),
      printf(({ level, message, label }) => {
        return `${typeof label == "undefined" ? "" : `[${label}] `}${level}: ${message}`
      }),
    ),
  }))
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
        return `[${timestamp}] ${typeof label == "undefined" ? "" : `[${label}] `}${level}: ${message}`
      }),
    ),
  }))
}

export default rootLogger
