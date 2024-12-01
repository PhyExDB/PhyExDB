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

const umzug = new Umzug({
  migrations: { glob: process.env.NUXT_DATABASE_MIGRATIONS_LOCATION! },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

const umzugSeeds = new Umzug({
  migrations: { glob: process.env.NUXT_DATABASE_SEEDS_LOCATION! },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

async function status() {
  const pendingMigrations = await umzug.pending()
  const executedMigrations = await umzug.executed()
  const pendingSeeds = await umzugSeeds.pending()
  const executedSeeds = await umzugSeeds.executed()

  console.log("\nCurrent Migration Status")
  console.log("Executed migrations:", executedMigrations.map(m => m.name))
  console.log("Pending migrations:", pendingMigrations.map(m => m.name))
  console.log("Executed seeds:", executedSeeds.map(m => m.name))
  console.log("Pending seeds:", pendingSeeds.map(m => m.name))

  await sequelize.close()
}

status()
