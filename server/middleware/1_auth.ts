export default defineEventHandler(async (event) => {
  const token = getHeader(event, "token");
  if (token === undefined) {
    authLogger.debug("No token found")
  } else {
    authLogger.debug("", { accessToken: token })

    try {
      const user = getUserFromAccessToken(token)
      authLogger.debug("AccessToken: User found")
      
      event.context.user = (await user).toUserDetail

    } catch (e) {}
    authLogger.debug("invalid AccessToken")
  }
})
