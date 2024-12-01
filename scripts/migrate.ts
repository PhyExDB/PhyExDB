import { umzug, sequelize } from "./setup.js"

async function migrate() {
  try {
    const migrations = await umzug.up()
    const migrationNames = migrations.map(migration => migration.name).join(", ")
    console.log("Migrations executed:", migrationNames)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

migrate()
