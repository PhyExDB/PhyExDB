import { Sequelize } from "sequelize"

const config = useRuntimeConfig()

const sequelize = new Sequelize(config.databaseName, config.databaseUser, config.databasePassword, {
  host: config.databaseHost,
  port: config.databasePort,
  dialect: "postgres",
})

export default sequelize
