import sequelize from "../utils/sequelize"

export default defineNitroPlugin(async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connected successfully.")

    // Sync all models
    await sequelize.sync({ alter: true }) // Use `alter: true` for development, but avoid in production
    console.log("All models were synchronized successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
