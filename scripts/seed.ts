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
  migrations: { glob: process.env.NUXT_DATABASE_SEEDS_LOCATION! },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

async function seed() {
  try {
    const migrations = await umzug.up()
    const migrationNames = migrations.map(migration => migration.name).join(", ")
    console.log("Seeds executed:", migrationNames)
  } catch (error) {
    console.error("Seeds failed:", error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

seed()
