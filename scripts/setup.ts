import { Umzug, SequelizeStorage } from "umzug"
import { Sequelize } from "sequelize"
import * as dotenv from "dotenv"

if (process.env.NODE_ENV === "production") {
  dotenv.config()
} else {
  dotenv.config({ path: ".env.development" })
}

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
  logger: console,
})

const umzugSeeds = new Umzug({
  migrations: { glob: `${databaseDir}/database/seeds/*.js` },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

export { umzug, umzugSeeds, sequelize }
