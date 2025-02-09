import { describe, expectTypeOf, vi } from "vitest"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import { filesIn, fileDetails } from "./data"
import endpoint from "~~/server/api/files/index.post"

describe("Api Route /api/files/index.post", () => {
  // definitions
  const body = {
    files: filesIn,
  }

  const data = undefined
  const expected = fileDetails

  const context = u.getTestContext({
    data, expected, endpoint,

    body,
  })

  // mocks
  mockUser(users.user)
  prisma.file.create = vi.fn().mockImplementation(async (params: {
    data: { path: string, originalName: string, mimeType: string }
  }) => {
    return Promise.resolve({
      id: "uuid",
      path: params.data.path,
      mimeType: params.data.mimeType,
      originalName: params.data.originalName,
    })
  })

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<FileDetail[]>()

    u.testSuccess(context)

    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
