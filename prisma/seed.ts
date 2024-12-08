import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function hash(password: string) {
  const salt = await bcrypt.genSalt()
  return await bcrypt.hash(password, salt)
}

async function userMigrations() {
  await prisma.user.create({
    data: {
      email: "user@test.test",
      username: "User",
      role: "USER",
      passwordHash: await hash("user"),
      verified: true,
    },
  })
  await prisma.user.create({
    data: {
      email: "moderator@test.test",
      username: "Moderator",
      role: "MODERATOR",
      passwordHash: await hash("moderator"),
      verified: true,
    },
  })
  await prisma.user.create({
    data: {
      email: "admin@test.test",
      username: "Admin",
      role: "ADMIN",
      passwordHash: await hash("admin"),
      verified: true,
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
