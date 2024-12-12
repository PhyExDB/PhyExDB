export default defineEventHandler((event) => {
  logger.debug(event.toJSON(), { label: "route" })
})
