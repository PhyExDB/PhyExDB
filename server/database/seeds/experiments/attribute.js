import { v4 } from "uuid"
/**
 * Seed the Attribute Table with initial data
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert("Attribute", [
    { id: v4(), name: "Attribut-1", createdAt: new Date(), updatedAt: new Date() },
  ])
}
/**
 * Revert the seeding of the Attribute Table
 */
export const down = async ({ contect: queryInterface }) => {
  await queryInterface.bulkDelete("Attribute", null, {})
}
