import sequelize from "../database/config"
import User from "../models/User"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  sequelize.sync()

  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }

  const users = await User.findAll()
  console.log(users)

  if (query.name) {
    return `Hello ${query.name}`
  } else {
    return "Hello World"
  }
})
