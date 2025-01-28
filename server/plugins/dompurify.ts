export default defineNitroPlugin((nitroApp) => {
  const domPurify = createDomPurify()
  Object.assign(nitroApp, { domPurify })
})
