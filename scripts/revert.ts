import { umzug, sequelize } from "./setup.js"

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
