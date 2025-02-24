import ExperimentSeed from "~~/server/seeds/experiment"
import ExperimentAttributeSeed from "~~/server/seeds/experimentAttribute"
import ExperimentSectionSeed from "~~/server/seeds/experimentSection"
import LegalSeed from "~~/server/seeds/legal"
import UserSeed from "~~/server/seeds/user"
import { logger } from "~~/server/lib/loggers"
import StartpageSeed from "~~/server/seeds/startpage"

export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed the database",
  },
  run: async () => {
    logger.info("Running DB seed task...")

    const seeds = [
      new LegalSeed(),
      new UserSeed(),
      new ExperimentSectionSeed(),
      new ExperimentAttributeSeed(),
      new ExperimentSeed(),
      new StartpageSeed(),
    ]

    try {
      for (const seed of seeds) {
        const shouldRun = await seed.shouldRun()
        if (shouldRun) {
          logger.info(`Running seed: ${seed.name}`)
          await seed.seed()
          await seed.afterRun()
        } else {
          logger.info(`Skipping seed: ${seed.name}`)
        }
      }

      logger.info("DB seed task completed")
      return { result: true }
    } catch (error) {
      logger.error("Error running seed", error)
      return { result: false, error }
    }
  },
})
