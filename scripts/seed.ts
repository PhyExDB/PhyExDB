import { umzugSeeds, sequelize } from "./setup.js"

async function seed() {
  try {
    const migrations = await umzugSeeds.up()
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
