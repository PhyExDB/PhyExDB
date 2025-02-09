import { describe, expectTypeOf, vi } from "vitest"
import { detail } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/users/files/[id].delete"

describe("Api Route /api/users/files/[id].delete", () => {
  // definitions
  const data = detail
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { id: data.id },
    user: users.user,
    additionalEventProperties: { $fetch: vi.fn() },
  })

  // mocks
  u.mockPrismaForIdDelete(context, "userFile")
  u.mockPrismaForIdDelete({ data: context.data.file }, "file")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testIdFails(context)
    u.testAuthFail(context, [users.unverified, users.mod, users.admin])
  }
})
