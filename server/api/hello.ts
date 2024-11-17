export default defineEventHandler(async event => {
  const query = getQuery(event)

  if (query.name) {
    return `Hello ${query.name}`
  } else {
    return "Hello World"
  }
})
