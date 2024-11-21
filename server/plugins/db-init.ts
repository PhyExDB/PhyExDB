import sequelize from "../utils/sequelize"
import "pg" // Do not remove this, because otherwise pg will not be included in the final bundle

export default defineNitroPlugin(async () => {
  try {
    // Connect to the database
    await sequelize.authenticate()
    console.log("Database connected successfully.")

    // Sync all models
    await sequelize.sync({ alter: true }) // Use `alter: true` for development, but avoid in production
    console.log("All models were synchronized successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
