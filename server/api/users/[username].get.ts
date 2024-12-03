import User from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")
  const users = await User.findAll({
    where: { username: username },
  },
  )
  return "Hello Nitro"
})
