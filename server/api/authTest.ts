export default defineEventHandler(async (event) => {
  await authorize(event, editLegalDocumentAbillity)
  return "Authorized"
})
