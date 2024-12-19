import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { encodeHex } from "oslo/encoding"
import { scryptAsync } from "@noble/hashes/scrypt"
import { getRandomValues } from "uncrypto"

// hashPassword function from better-aut
// https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/crypto/password.ts
const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

async function generateKey(password: string, salt: string) {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2,
  })
}

const hashPassword = async (password: string) => {
  const salt = encodeHex(getRandomValues(new Uint8Array(16)))
  const key = await generateKey(password, salt)
  return `${salt}:${encodeHex(key)}`
}

const prisma = new PrismaClient()

async function userMigrations() {
  await prisma.account.create({
    data: {
      password: await hashPassword("password"),
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
      password: await hashPassword("password"),
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
      password: await hashPassword("password"),
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

async function sectionMigrations() {
  await prisma.experimentSection.createMany({
    data: [
      { name: "Versuchsziel", order: 0 },
      { name: "Material", order: 1 },
      { name: "Versuchsaufbau", order: 2 },
      { name: "Durchführung", order: 3 },
      { name: "Beobachtung", order: 4 },
      { name: "Ergebnis", order: 5 },
      { name: "Tipps & Tricks", order: 6 },
    ],
  })
}

async function experimentMigrations() {
  const attribute = await prisma.experimentAttribute.create({
    data: {
      name: "Themenbereich",
      slug: "thema",
    },
  })
  // Maybe this works
  /*
  const attribute = await prisma.experimentAttribute.create({
    data: {
      name: "Themenbereich",
      slug: "thema",
      values: {
        create: {
          name: "Magnetismus",
        },
      },
    },
  })*/
  const attributeValue = await prisma.experimentAttributeValue.create({
    data: {
      name: "Magnetismus",
      attribute: {
        connect: { id: attribute.id },
      },
    },
  })
  await prisma.experiment.create({
    data: {
      name: "Magnetismus Experiment",
      slug: "magnetismus-experiment",
      user: {
        connect: {
          id: (await prisma.user.findFirst())?.id ?? (() => { throw new Error("No user found") })(),
        },
      },
      status: "PUBLISHED",
      duration: 5,
      attributes: {
        connect: { id: attributeValue.id },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

async function main() {
  await userMigrations()
  await legalMigrations()
  await sectionMigrations()
  await experimentMigrations()
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
