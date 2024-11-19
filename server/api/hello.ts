import sequelize from "../database/config"
import User from "../models/User"

export default defineEventHandler(async () => {
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }

  const users = await User.findAll()
  let description: string = ""
  console.log(users.length)
  for (let i = 0; i < users.length; i++) {
    description += `[Name = ${users[i].getDataValue("username")}, Mail = ${users[i].getDataValue("email")}, Password = ${users[i].getDataValue("password")}] \t`
  }

  return `Users: \t ${description}`
})
