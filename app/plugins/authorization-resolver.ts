export default defineNuxtPlugin({
  name: "authorization-resolver",
  parallel: true,
  setup() {
    return {
      provide: {
        authorization: {
          resolveClientUser: () => {
            // Your logic to retrieve the user from the client
            return "Max Musterman"
          },
        },
      },
    }
  },
})
