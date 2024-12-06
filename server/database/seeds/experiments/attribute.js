import { v4 } from "uuid"

export const up = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert("Attribute", [
    { id: v4(), name: "Attribut-1", createdAt: new Date(), updatedAt: new Date() },
  ])
}

export const down = async ({ contect: queryInterface }) => {
  await queryInterface.bulkDelete("Attribute", null, {})
