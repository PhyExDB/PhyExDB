export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, "Authorization")
  if (authorization === undefined) {
    authLogger.debug("No authorization found")
  } else {
    authLogger.debug("", { authorization: authorization })

    const token = authorization.replace("Bearer ", "")

    try {
      const user = getUserFromAccessToken(token)
      authLogger.debug("AccessToken: User found")

      event.context.user = (await user).toDetail()
    } catch (error) {
      consume(error)
    }
  }
})
