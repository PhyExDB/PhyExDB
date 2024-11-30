import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle
import { umzug, seed } from "../utils/umzug"

export default defineNitroPlugin(async () => {
  try {
    const migrations = await umzug.up()
    const migrationNames = migrations.map(migration => migration.name).join(", ")
    logger.info(`Migrations executed: ${migrationNames}`)
    const seeds = await seed.up()
    const seedNames = seeds.map(seed => seed.name).join(", ")
    logger.info(`Seeds executed: ${seedNames}`)
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
