import prisma from "../lib/prisma"
import Seed from "./seed"
import slugify from "~~/server/utils/slugify"

/**
 * Experiment section seed.
 */
export default class ExperimentSectionSeed extends Seed {
  constructor() {
    super("experimentSection")
  }

  /**
   * Seeds the database with experiment sections.
   */
  async seed() {
    const sections = [
      "Versuchsziel",
      "Material",
      "Versuchsaufbau",
      "Durchführung",
      "Beobachtung",
      "Ergebnis",
      "Tipps und Tricks",
      "Gefährdungsbeurteilung",
    ]

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const slug = slugify(section)

      await prisma.experimentSection.upsert({
        where: { slug: slug },
        update: {
          name: section,
          order: i,
        },
        create: {
          name: section,
          slug: slug,
          order: i,
        },
      })
    }
  }
}
