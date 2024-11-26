import User from "../database/models/User"

export default defineEventHandler(async () => {
  const users = await User.findAll()
  let description: string = ""
  for (let i = 0; i < users.length; i++) {
    description += `[Name = ${users[i].getDataValue("username")}, Mail = ${users[i].getDataValue("email")}, Password = ${users[i].getDataValue("password")}] \t`
  }

  return `Users: \t ${description}`
})
