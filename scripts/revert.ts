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

async function revert() {
  try {
    const reverted = await umzug.down()
    const migrationNames = reverted.map(migration => migration.name).join(", ")
    console.log("Migrations reverted:", migrationNames)
  } catch (error) {
    console.error("Revert failed:", error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

revert()
