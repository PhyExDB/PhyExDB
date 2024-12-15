export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    event.context.$authorization = {
      resolveServerUser: async () => {
        const session = await auth.api.getSession({
          headers: event.headers,
        })
        return session?.user
      },
    }
  })
})
