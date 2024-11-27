import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle
import { umzug, seed } from "../utils/umzug"

export default defineNitroPlugin(async () => {
  try {
    const migrations = await umzug.up()
    logger.info("Migrations executed:", migrations)
    const seeds = await seed.up()
    logger.info("Seeds executed:", seeds)
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
