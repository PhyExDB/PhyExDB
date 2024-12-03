import User from "../database/models/User"
import logger from "~~/server/utils/loggers"

export default defineEventHandler(async () => {
  logger.info("asked for hello")

  const users = await User.findAll()
  let description: string = ""
  for (const element of users) {
    description += `[Name = ${element.getDataValue("username")}, Mail = ${element.getDataValue("email")}, Password = ${element.getDataValue("passwordHash")}] \t`
  }

  return `Users: \t ${description}`
})
