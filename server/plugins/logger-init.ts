import logger from "../utils/logger"

export default defineNitroPlugin(() => {
  logger.info("Logger initialized")
})
