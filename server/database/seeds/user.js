import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

/**
 * Seed the User table with initial data.
 */
export const up = async ({ context: queryInterface }) => {
  const salt = bcrypt.genSaltSync()
  await queryInterface.bulkInsert("Users", [
    { id: uuidv4(), username: "Alice", role: "Administrator", email: "Alice@gmail.com", passwordHash: bcrypt.hashSync("secure", salt), verified: true, createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), username: "Bob", role: "Moderator", email: "Bob@gmail.com", passwordHash: bcrypt.hashSync("ILikeAlice", salt), verified: true, createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), username: "Eve", role: "User", email: "Eve@gmail.com", passwordHash: bcrypt.hashSync("password", salt), verified: true, createdAt: new Date(), updatedAt: new Date() },
  ])
}

/**
 * Revert the seeding of the User table.
 */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete("Users", null, {})
}
