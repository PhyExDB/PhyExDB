export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  if (!session) {
    return {
      status: 401,
      body: "Unauthorized",
    }
  }
  return session
})
