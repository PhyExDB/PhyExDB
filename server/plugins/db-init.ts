import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle

export default defineNitroPlugin(async () => {
  try {
    const migrations = await umzug.up()
    console.log("Migrations executed:", migrations)
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
