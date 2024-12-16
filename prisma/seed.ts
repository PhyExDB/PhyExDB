import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

async function userMigrations() {
  await prisma.account.create({
    data: {
      /* password: password */
      password: "d5e0f1c480664b5cebf349bb252b2d95:d8b59da61839c29ff838df0df6b00082c21f8c999de07467b71cd19fc2dedd519042d6d0b6b043d0ac3367dec911c9ba54fd7acb4e6758159a034d4b2f713c40",
      providerId: "credential",
      accountId: uuidv4(),
      id: uuidv4(),
      user: {
        create: {
          role: "USER",
          name: "User",
          email: "user@test.test",
          emailVerified: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.account.create({
    data: {
      password: "d5e0f1c480664b5cebf349bb252b2d95:d8b59da61839c29ff838df0df6b00082c21f8c999de07467b71cd19fc2dedd519042d6d0b6b043d0ac3367dec911c9ba54fd7acb4e6758159a034d4b2f713c40",
      providerId: "credential",
      accountId: uuidv4(),
      id: uuidv4(),
      user: {
        create: {
          role: "MODERATOR",
          name: "Moderator",
          email: "moderator@test.test",
          emailVerified: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.account.create({
    data: {
      password: "d5e0f1c480664b5cebf349bb252b2d95:d8b59da61839c29ff838df0df6b00082c21f8c999de07467b71cd19fc2dedd519042d6d0b6b043d0ac3367dec911c9ba54fd7acb4e6758159a034d4b2f713c40",
      providerId: "credential",
      accountId: uuidv4(),
      id: uuidv4(),
      user: {
        create: {
          role: "ADMIN",
          name: "Admin",
          email: "admin@test.test",
          emailVerified: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

async function legalMigrations() {
  await prisma.legalDocument.create({
    data: {
      name: "Privacy Policy",
      slug: "privacy-policy",
      text: "This is the privacy policy.",
    },
  })
  await prisma.legalDocument.create({
    data: {
      name: "Terms of Service",
      slug: "terms-of-service",
      text: "These are the terms of service.",
    },
  })
  await prisma.legalDocument.create({
    data: {
      name: "Imprint",
      slug: "imprint",
      text: "This is the imprint.",
    },
  })
}

async function main() {
  await userMigrations()
  await legalMigrations()
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
