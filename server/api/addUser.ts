import User from "../database/models/User"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (query.name && query.mail && query.password) {
    await User.create({ username: query.name, email: query.mail, passwordHash: "" + query.password, verified: true })
    return `Created new User`
  } else {
    return "Pass data in the format /api/addUser?name=SomeName&mail=SomeMail&password=SomePassword"
  }
})
