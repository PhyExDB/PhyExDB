export default defineNuxtPlugin({
  name: "authorization-resolver",
  parallel: true,
  setup() {
    return {
      provide: {
        authorization: {
          resolveClientUser: async () => {
            // Your logic to retrieve the user from the client
            const { data: session } = await authClient.useSession(useFetch)
            return session?.value?.user
          },
        },
      },
    }
  },
})
