import { describe, expectTypeOf } from "vitest"
import { files } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/files/[id].delete"

describe("Api Route /api/files/[id].delete", () => {
  // definitions
  const data = files[0]!
  const expected = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { id: data.id },
  })

  // mocks
  mockUser(users.user)
  u.mockPrismaForIdDelete(context, "file")

  // tests
  {
    u.testSuccess(context)

    u.testIdFails(context)
    u.testAuthFail(context, [users.unverified, users.mod, users.admin])
  }
})
