import { v4 as uuidv4 } from "uuid"

/**
 * Seed the Legal table with initial data.
 */
export const up = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert("Legal", [
    { id: uuidv4(), name: "Privacy Policy", slug: "privacy-policy", content: "This is the privacy policy.", createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), name: "Terms of Service", slug: "terms-of-service", content: "This is the terms of service.", createdAt: new Date(), updatedAt: new Date() },
    { id: uuidv4(), name: "Imprint", slug: "imprint", content: "This is the imprint.", createdAt: new Date(), updatedAt: new Date() },
  ])
}

/**
 * Revert the seeding of the Legal table.
 */
export const down = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete("Legal", null, {})
}
