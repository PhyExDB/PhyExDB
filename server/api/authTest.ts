// import { testAbillity, forbiddenAbillity } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  await authorize(event, forbiddenAbillity)
  return "Authorized"
})
