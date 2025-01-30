export default defineNitroPlugin(async () => {
  await runTask("db:migrate")
  await runTask("db:seed")
})
