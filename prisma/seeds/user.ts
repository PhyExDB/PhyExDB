import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

// password: password
const passwordHash = "7909e84c2f533030cd283e700834f355:9308a253a95c78259448d990960c41738fb5c89519febce3863347be087ce636bcf0815ae312b65b66c5f3f4a3605d1418cdecbef6f982e3f65e317220789220"

const prisma = new PrismaClient()

async function createUser(user: UserDetail) {
  await prisma.account.create({
    data: {
      password: passwordHash,
      providerId: "credential",
      accountId: uuidv4(),
      id: uuidv4(),
      user: {
        create: {
          id: user.id,
          role: user.role,
          name: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

/**
 * Seeds the database with initial user data.
 */
export async function userMigrations() {
  const users: UserDetail[] = [
    {
      id: uuidv4(),
      username: "User",
      role: "USER",
      email: "user@test.test",
      emailVerified: true,
    },
    {
      id: uuidv4(),
      username: "Moderator",
      role: "MODERATOR",
      email: "moderator@test.test",
      emailVerified: true,
    },
    {
      id: uuidv4(),
      username: "Admin",
      role: "ADMIN",
      email: "admin@test.test",
      emailVerified: true,
    },
    {
      id: uuidv4(),
      username: "Unverified",
      role: "USER",
      email: "unverified@test.test",
      emailVerified: false,
    },
  ]
  users.forEach(async user => createUser(user))
}
