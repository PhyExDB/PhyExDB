import { PrismaClient } from "@prisma/client"
import slugify from "~~/server/utils/slugify"

const prisma = new PrismaClient()

/**
 * Seeds the database with initial experiment sections data.
 */
export async function experimentSectionMigrations() {
  const sections = [
    "Versuchsziel",
    "Material",
    "Versuchsaufbau",
    "Durchführung",
    "Beobachtung",
    "Ergebnis",
    "Tipps und Tricks",
  ]

  await prisma.experimentSection.createMany({
    data: sections.map((section, index) => ({
      name: section,
      slug: slugify(section),
      order: index,
    })),
  })
}
