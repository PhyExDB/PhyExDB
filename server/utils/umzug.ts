import { Umzug, SequelizeStorage } from "umzug"
import sequelize from "./sequelize"

const umzug = new Umzug({
  migrations: { glob: "server/database/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

const seed = new Umzug({
  migrations: { glob: "server/database/seeds/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

export { umzug, seed }
