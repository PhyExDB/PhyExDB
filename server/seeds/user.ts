import { v4 as uuidv4 } from "uuid"
import Seed from "./seed"
import prisma from "../lib/prisma"

/**
 * User seed.
 */
export default class UserSeed extends Seed {
  constructor() {
    super("user")
  }

  /**
   * Hashed password for all users.
   */
  private passwordHash = "7909e84c2f533030cd283e700834f355:9308a253a95c78259448d990960c41738fb5c89519febce3863347be087ce636bcf0815ae312b65b66c5f3f4a3605d1418cdecbef6f982e3f65e317220789220"

  /**
   * Creates a user.
   * @param user User details.
   */
  private async createUser(user: UserDetail) {
    await prisma.account.create({
      data: {
        password: this.passwordHash,
        providerId: "credential",
        accountId: uuidv4(),
        id: uuidv4(),
        user: {
          create: {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  private devUsers(): UserDetail[] {
    const users: UserDetail[] = [
      {
        id: uuidv4(),
        name: "User",
        role: "USER",
        email: "user@test.test",
        emailVerified: true,
      },
      {
        id: uuidv4(),
        name: "Moderator",
        role: "MODERATOR",
        email: "moderator@test.test",
        emailVerified: true,
      },
      {
        id: uuidv4(),
        name: "Admin",
        role: "ADMIN",
        email: "admin@test.test",
        emailVerified: true,
      },
      {
        id: uuidv4(),
        name: "Unverified",
        role: "USER",
        email: "unverified@test.test",
        emailVerified: false,
      },
    ]
    return users
  }

  private prodUsers(): UserDetail[] {
    const users: UserDetail[] = [
      {
        id: uuidv4(),
        name: "Admin",
        role: "ADMIN",
        email: "admin@test.test",
        emailVerified: false,
      },
      {
        id: uuidv4(),
        name: "User",
        role: "USER",
        email: "user@test.test",
        emailVerified: false,
      },
    ]
    return users
  }

  /**
   * Seeds the database with users.
   */
  async seed() {
    let users: UserDetail[]
    if (import.meta.dev) {
      logger.info("Seeding dev users")
      users = this.devUsers()
    } else {
      logger.info("Seeding production users")
      users = this.prodUsers()
    }
    await Promise.all(users.map(async user => this.createUser(user)))
  }
}
