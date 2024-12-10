import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

function hash(password) {
  const salt = bcrypt.genSaltSync()
  return bcrypt.hashSync(password, salt)
}

/**
 * Seed the User table with initial data.
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert("Users", [
    { id: uuidv4(), username: "Alice", role: "Administrator", email: "Alice@gmail.com", passwordHash: hash("secure"), verified: true, createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), username: "Bob", role: "Moderator", email: "Bob@gmail.com", passwordHash: hash("ILikeAlice"), verified: true, createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), username: "Eve", role: "User", email: "Eve@gmail.com", passwordHash: hash("password"), verified: true, createdAt: new Date(), updatedAt: new Date() },

    { id: uuidv4(), username: "Admin", role: "Administrator", email: "admin@mail.com", passwordHash: hash("admin"), verified: true, createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), username: "Mod", role: "Moderator", email: "mod@mail.com", passwordHash: hash("mod"), verified: true, createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), username: "User", role: "User", email: "user@mail.com", passwordHash: hash("user"), verified: true, createdAt: new Date(), updatedAt: new Date() },
  ])
}

/**
 * Revert the seeding of the User table.
 */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete("Users", null, {})
}
