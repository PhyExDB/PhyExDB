import sequelize from "../utils/sequelize"
import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle

export default defineNitroPlugin(async () => {
  try {
    // Connect to the database
    await sequelize.authenticate()
    console.log("Database connected successfully.")

    // Sync all models
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
    } else {
      await sequelize.sync()
    }
    console.log("All models were synchronized successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
