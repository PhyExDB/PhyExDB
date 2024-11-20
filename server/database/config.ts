import { Sequelize } from "sequelize"

const config = useRuntimeConfig()

const db = new Sequelize(config.databaseName, config.databaseUser, config.databasePassword, {
  host: config.databaseHost,
  port: config.databasePort,
  dialect: "postgres",
})

db.sync()

export default db
