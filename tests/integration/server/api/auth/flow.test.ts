import { describe, expect, it, assertType } from "vitest"
import { setup, $fetch, url } from "@nuxt/test-utils/e2e"
import { v4 as uuidv4 } from "uuid"
import type { Tokens, TokensWithUserDetail } from "~~/shared/types/Auth"

describe("Api Routes /api/auth/", async () => {
  await setup()

  it("full flow", async () => {
    const registerContent = {
      username: `user${uuidv4()}`,
      email: `user${uuidv4()}@example.com`,
      password: "password123Secure.",
    }

    const registerResponse = await $fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(registerContent),
    })

    assertType<TokensWithUserDetail>(registerResponse)
    const { password, ...userDetailContent } = { ...registerContent, role: "USER" }
    expect(registerResponse.user).toMatchObject(userDetailContent)

    const sessionResponse = await $fetch("/api/auth/session", {
      method: "GET",
      headers: {
        token: registerResponse.accessToken,
      },
    })
    assertType<UserDetail>(sessionResponse)
    expect(sessionResponse).toMatchObject(userDetailContent)

    await $fetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refreshToken: registerResponse.refreshToken,
      }),
    })

    const loginResponse = await $fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        usernameOrEmail: registerContent.username,
        password: registerContent.password,
      }),
    })
    assertType<Tokens>(loginResponse)

    let refreshToken = loginResponse.refreshToken
    for (let i = 0; i < 3; i++) {
      const refreshResponse = await $fetch("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      })
      assertType<Tokens>(refreshResponse)
      refreshToken = refreshResponse.refreshToken
    }

    await $fetch(url("/api/auth/logout"), {
      method: "POST",
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    })
  })
})
