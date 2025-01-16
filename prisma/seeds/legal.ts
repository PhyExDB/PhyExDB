import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seeds the database with initial legal data.
 */
export async function legalMigrations() {
  await prisma.legalDocument.createMany({
    data: [
      {
        name: "Privacy Policy",
        slug: "privacy-policy",
        text: "This is the privacy policy.",
      },
      {
        name: "Terms of Service",
        slug: "terms-of-service",
        text: "These are the terms of service.",
      },
      {
        name: "Imprint",
        slug: "imprint",
        text: "This is the imprint.",
      },
    ],
  })
}
