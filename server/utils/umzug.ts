import { Umzug, SequelizeStorage } from "umzug"
import sequelize from "./sequelize"
import "ts-node/register"

const umzug = new Umzug({
  migrations: { glob: "server/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

export default umzug
