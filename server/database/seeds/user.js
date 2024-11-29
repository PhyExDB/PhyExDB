import { v4 as uuidv4 } from "uuid"

/**
 * Seed the User table with initial data.
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert("User", [
    { id: uuidv4(), username: "Alice", role: "Administrator", email: "Alice@gmail.com", passwordHash: "secure", verified: true, createdAt: new Date(), updatedAt: new Date() },
  ])
}

/**
 * Revert the seeding of the User table.
 */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete("User", null, {})
}
