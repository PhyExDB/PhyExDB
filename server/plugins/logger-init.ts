import { logger } from "../utils/loggers"

export default defineNitroPlugin(() => {
  logger.info("Logger initialized")
})
