import Legal from "~~/server/database/models/Legal"

export default defineEventHandler(async () => {
  const documents = await Legal.findAll()

  return documents.map(document => document.toLegalList())
})
