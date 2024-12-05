import { Umzug, SequelizeStorage, type MigrationMeta } from "umzug"
import { Sequelize } from "sequelize"
import * as dotenv from "dotenv"
import winston, { format } from "winston"

if (process.env.NODE_ENV === "production") {
  dotenv.config()
} else {
  dotenv.config({ path: ".env.development" })
}

const { printf, combine, timestamp, colorize, json } = format

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: process.env.NUXT_LOG_LEVEL,
  format: combine(
    timestamp(),
    json(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        format(
          (info, _) => info,
        )(),
        colorize(),
        printf(({ level, message, label }) => {
          return `${level}${typeof label == "undefined" ? "" : ` ${label}`}: ${message}`
        }),
      ),
    }),

  ],
})

const requiredEnvVars = [
  "NUXT_DATABASE_NAME",
  "NUXT_DATABASE_USER",
  "NUXT_DATABASE_PASSWORD",
  "NUXT_DATABASE_HOST",
  "NUXT_DATABASE_PORT",
  "NUXT_DATABASE_DIR_LOCATION",
]

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.error(`${envVar} is not set. Please set it in your environment variables.`)
    process.exit(1)
  }
})

const sequelize = new Sequelize(
  process.env.NUXT_DATABASE_NAME!,
  process.env.NUXT_DATABASE_USER!,
  process.env.NUXT_DATABASE_PASSWORD!,
  {
    host: process.env.NUXT_DATABASE_HOST,
    port: Number(process.env.NUXT_DATABASE_PORT),
    dialect: "postgres",
  },
)

const databaseDir = process.env.NUXT_DATABASE_DIR_LOCATION!

const umzug = new Umzug({
  migrations: { glob: `${databaseDir}/database/migrations/*.js` },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: logger,
})

const umzugSeeds = new Umzug({
  migrations: { glob: `${databaseDir}/database/seeds/*.js` },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: logger,
})

/**
 * Executes a given asynchronous action and handles success and failure scenarios.
 *
 * @param action - A function that returns a promise resolving to an array of MigrationMeta objects.
 * @param successDescription - A message to log upon successful completion of the action.
 * @param failureDescription - A message to log upon failure of the action.
 *
 * @throws Will log the failure description and exit the process with code 1 if the action throws an error.
 */
async function performAction(action: () => Promise<MigrationMeta[]>, { successDescription, failureDescription }: { successDescription: string, failureDescription: string }) {
  try {
    const migrations = await action()
    const migrationNames = migrations.map(migration => migration.name).join(", ")
    logger.info(`${successDescription} ${migrationNames}`)
  } catch (error) {
    logger.error(`${failureDescription} ${error}`)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

export { umzug, umzugSeeds, sequelize, performAction, logger }
