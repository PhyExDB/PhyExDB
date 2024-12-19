import { getUser } from "../utils/auth"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    event.context.$authorization = {
      resolveServerUser: async () => {
        return getUser(event)
      },
    }
  })
})
