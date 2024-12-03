import logger from "~~/server/utils/loggers"

export default defineEventHandler((event) => {
  logger.debug(event.toJSON(), { label: "route" })
})
