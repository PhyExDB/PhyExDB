import Seed from "./seed"
import prisma from "~~/server/lib/prisma"
import { SIGNS } from "~~/app/utils/constants/signs"

/**
 * Seeds the databse with safety and warning seeds
 */
export default class SyncSignsSeed extends Seed {
  constructor() {
    super("SyncSignsSeed")
  }

  /**
   * Returns the signs to seed based on environment
   */
  private getSigns() {
    if (import.meta.dev) {
      // Use all signs in dev
      return SIGNS
    } else {
      return SIGNS.filter(sign => sign.category === "safety")
    }
  }

  /**
   * Seeds the database with signs.
   */
  async seed() {
    const signs = this.getSigns()
    await Promise.all(signs.map(async (sign) => {
      const existing = await prisma.sign.findFirst({
        where: { name: sign.name },
      })

      if (!existing) {
        await prisma.sign.create({
          data: {
            id: crypto.randomUUID(),
            name: sign.name,
            type: sign.category.toUpperCase() as "SAFETY" | "WARNING",
            iconPath: sign.filename,
          },
        })
      }
    }))
  }
}
