import User from "../../database/models/User"

export default defineEventHandler(async () => {
  const users = await User.findAll()
  let result: string = ""
  for (let i = 0; i < users.length; i++) {
    result += `${i}: UserID = ${users[i].getDataValue("id")}, Name = ${users[i].getDataValue("username")}, E-Mail = ${users[i].getDataValue("email")}, Hash = ${users[i].getDataValue("passwordHash")}, Verified? = ${users[i].getDataValue("verified")}<br>`
  }
  return result
})
