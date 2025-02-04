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
    ]

    await prisma.experimentSection.createMany({
      data: sections.map((section, index) => ({
        name: section,
        slug: slugify(section),
        order: index,
      })),
    })
  }
}
