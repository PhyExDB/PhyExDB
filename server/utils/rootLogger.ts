import winston, { format } from "winston"

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
    // prettyPrint only in development
    process.env.NODE_ENV === "development" ? json() : prettyPrint(),
  ),
  transports: [

    new winston.transports.File({
      filename: path + "logfile.log",
      level: config.logLevel,
    }),

  ],
})

// only log to terminal in development
if (process.env.NODE_ENV === "development") {
  rootLogger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      printf(({ level, message, label }) => {
        return `${typeof label == "undefined" ? "" : `[${label}] `}${level}: ${message}`
      }),
    ),
  }))
}

export default rootLogger
