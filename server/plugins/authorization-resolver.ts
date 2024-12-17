import { useUser } from "../utils/auth"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    event.context.$authorization = {
      resolveServerUser: async () => {
        return useUser(event)
      },
    }
  })
})
