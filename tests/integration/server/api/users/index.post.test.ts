import { afterEach, describe, expect, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import User from "~~/server/database/models/User"

describe("Api Route /api/users", async () => {
  await setup()

  it("Should create a new user", async () => {
    const testUser = {
      username: "TestUser",
      email: "test@example.com",
      password: "TestPassword123",
    }

    const response = await $fetch("/api/users", {
      method: "POST",
      body: testUser,
    })

    expect(response).toBeDefined()
    expect(response.username).toBe(testUser.username)
    expect(response.email).toBe(testUser.email)
    expect(response.role).toBe("User")
    expect(response.verified).toBe(false)
    expect(response.id).toBeDefined()

    // Verify user was created in database
    const dbUser = await User.findOne({ where: { email: testUser.email } })
    expect(dbUser).toBeDefined()
    // Additional check to ensure user was found and therefor we can access his attributes
    if (!dbUser) {
      throw new Error("User not found in database")
    }
    expect(dbUser.username).toBe(testUser.username)

    // Clean up the created user
    await User.destroy({ where: { username: "TestUser" } })
  })

  it("Should fail with invalid username", async () => {
    const invalidUser = {
      username: "",
      email: "email@gmail.com",
      password: "Pw1234?wkl",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Please enter Name")
  })

  it("Should fail with invalid email", async () => {
    const invalidUser = {
      username: "Levi",
      email: "emailohneaetzeichen",
      password: "Pw1234?wkl",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Not an email")

    const invalidUser2 = {
      username: "Levi",
      email: "",
      password: "Pw1234?wkl",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser2,
    })).rejects.toThrow("Please enter email")
  })

  it("Should fail with empty password", async () => {
    const invalidUser = {
      username: "Levi",
      email: "email@gmail.com",
      password: "",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Please enter password")
  })

  it("Should fail with a too short password", async () => {
    const invalidUser = {
      username: "Levi",
      email: "email@gmail.com",
      password: "short",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Password must be at least 8 characters")
  })

  it("Should fail with a password without lowercase letter", async () => {
    const invalidUser = {
      username: "Levi",
      email: "email@gmail.com",
      password: "KEINKLEIN1",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Password must contain at least one lowercase letter")
  })

  it("Should fail with a password without uppercase letter", async () => {
    const invalidUser = {
      username: "Levi",
      email: "email@gmail.com",
      password: "keingross1",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Password must contain at least one uppercase letter")
  })

  it("Should fail with a password without a number", async () => {
    const invalidUser = {
      username: "Levi",
      email: "email@gmail.com",
      password: "KeineZahlen",
    }

    await expect($fetch("/api/users", {
      method: "POST",
      body: invalidUser,
    })).rejects.toThrow("Password must contain at least one number")
  })
})
