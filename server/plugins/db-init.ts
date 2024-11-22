import sequelize from "../utils/sequelize"
import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle
import "../models/User"

export default defineNitroPlugin(async () => {
  try {
    // Connect to the database
    await sequelize.authenticate()

    // Sync all models
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
    } else {
      await sequelize.sync()
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
