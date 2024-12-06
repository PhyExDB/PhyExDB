import { v4 } from "uuid"
/**
 * Seed the Value Table with initial data
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert("Value", [
    { id: v4(), attributeValue: v4(), name: "Value-1", createdAt: new Date(), updatedAt: new Date() },
  ])
}
/**
 * Revert the seeding of the Attribute Table
 */
export const down = async ({ contect: queryInterface }) => {
  await queryInterface.bulkDelete("Value", null, {})
}
