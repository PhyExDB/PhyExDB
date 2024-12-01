import { umzugSeeds, sequelize, umzug } from "./setup.js"

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
