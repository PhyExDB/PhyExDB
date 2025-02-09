import PrismaInternals from "@prisma/internals"
import PrismaMigrate from "@prisma/migrate"

export default defineTask({
  meta: {
    name: "db:migrate",
    description: "Migrate the database",
  },
  run: async () => {
    logger.info("Running DB migration task...")
    let migrate

    try {
      const schemaPathResult = await PrismaInternals.getSchemaWithPath()
      if (!schemaPathResult.schemaPath) {
        logger.error("No schema found")
        return { result: false }
      }

      migrate = new PrismaMigrate.Migrate(schemaPathResult.schemaPath)

      const { migrations } = await migrate.listMigrationDirectories()
      if (migrations.length > 0) {
        logger.info(`${migrations.length} migration(s) found`)
      } else {
        logger.info("No migration found")
      }

      const { appliedMigrationNames } = await migrate.applyMigrations()
      if (appliedMigrationNames.length > 0) {
        logger.info(`The following migration(s) have been applied: ${appliedMigrationNames.join(", ")}`)
      } else {
        logger.info("No pending migrations to apply")
      }

      return { result: true }
    } catch (error) {
      logger.error("Error running migrations", error)
      return { result: false, error }
    } finally {
      migrate?.stop()
    }
  },
})
