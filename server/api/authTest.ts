export default defineEventHandler(async (event) => {
  await authorize(event, forbiddenAbillity)
  return "Authorized"
})
