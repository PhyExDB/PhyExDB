import sequelize from "../database/config"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }

  if (query.name) {
    return `Hello ${query.name}`
  } else {
    return "Hello World"
  }
})
