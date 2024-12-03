import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle
import sequelize from "~~/server/utils/sequelize"
import logger from "~~/server/utils/loggers"

export default defineNitroPlugin(async () => {
  try {
    sequelize.authenticate()
    logger.info("Connection to database has been established successfully.")
  } catch (error) {
    logger.error("Unable to connect to the database:", error)
  }
})
