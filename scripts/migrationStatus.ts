import { umzug, umzugSeeds, sequelize, logger } from "./setup.js"

async function status() {
  const pendingMigrations = await umzug.pending()
  const executedMigrations = await umzug.executed()
  const pendingSeeds = await umzugSeeds.pending()
  const executedSeeds = await umzugSeeds.executed()

  const statusMessage = `
Current Migration Status:
Executed migrations: ${executedMigrations.map(m => m.name).join(", ")}
Pending migrations: ${pendingMigrations.map(m => m.name).join(", ")}
Executed seeds: ${executedSeeds.map(m => m.name).join(", ")}
Pending seeds: ${pendingSeeds.map(m => m.name).join(", ")}
  `
  logger.info(statusMessage)

  await sequelize.close()
}

await status()
