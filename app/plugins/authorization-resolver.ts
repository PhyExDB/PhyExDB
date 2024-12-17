export default defineNuxtPlugin({
  name: "authorization-resolver",
  parallel: true,
  setup() {
    return {
      provide: {
        authorization: {
          resolveClientUser: async () => {
            // Your logic to retrieve the user from the client
            return (await useUser())?.value
          },
        },
      },
    }
  },
})
