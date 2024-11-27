import { Sequelize } from "sequelize"
import dbLogger from "./dbLogger"

const config = useRuntimeConfig()

const db = new Sequelize(config.databaseName, config.databaseUser, config.databasePassword, {
  host: config.databaseHost,
  port: config.databasePort,
  dialect: "postgres",
  logging: (...msg) => dbLogger.debug(msg.toString()),
})

export default db
