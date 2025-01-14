import { PrismaClient } from "@prisma/client"
import { userMigrations } from "./seeds/user"
import { legalMigrations } from "./seeds/legal"
import { experimentMigrations } from "./seeds/experiment"
import { experimentAttributeMigrations } from "./seeds/experimentAttribute"
import { experimentSectionMigrations } from "./seeds/experimentSection"

const prisma = new PrismaClient()

async function main() {
  await userMigrations()
  await legalMigrations()
  await experimentMigrations()
  await experimentAttributeMigrations()
  await experimentSectionMigrations()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
