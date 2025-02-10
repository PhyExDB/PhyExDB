import { logger } from "../lib/loggers"

export default defineNitroPlugin(() => {
  logger.info("Logger initialized")
})
