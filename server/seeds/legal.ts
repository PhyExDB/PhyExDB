import Seed from "./seed"
import prisma from "../lib/prisma"

/**
 * Legal seed.
 */
export default class LegalSeed extends Seed {
  constructor() {
    super("legal")
  }

  /**
   * Seeds the database with legal documents.
   */
  async seed() {
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
}
