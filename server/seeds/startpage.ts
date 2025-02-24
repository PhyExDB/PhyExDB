import prisma from "../lib/prisma"
import Seed from "./seed"

/**
 * Startpage seed.
 */
export default class StartpageSeed extends Seed {
  constructor() {
    super("startpage")
  }

  /**
   * Seeds the database with the startpage.
   */
  async seed() {
    await prisma.startpage.createMany({
      data: [
        {
          id: true,
          text: "Startpage",
          description: "Description",
        },
        {
          id: false,
          text: "Welcome to the dark side.",
          description: "--- --- ---",
        },
      ],
    })
  }
}
