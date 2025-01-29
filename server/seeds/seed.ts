export default abstract class Seed {
  /**
   * The name of the seed.
   */
  name: string

  constructor(name: string) {
    this.name = name
  }

  /**
   * Checks if the seed should run.
   * @returns {boolean} Whether the seed should run.
   */
  async shouldRun(): Promise<boolean> {
    const count = await prisma.seedStatus.count({
      where: {
        name: this.name,
      },
    })
    return count === 0
  }

  /**
   * Seeds the database.
   */
  abstract seed(): Promise<void>

  /**
   * Runs the seed.
   */
  async afterRun(): Promise<void> {
    await prisma.seedStatus.create({
      data: {
        name: this.name,
      },
    })
  }
}
