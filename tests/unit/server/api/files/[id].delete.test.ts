import { describe, expectTypeOf } from "vitest"
import { files } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/files/[id].delete"

describe("Api Route /api/files/[id].delete", () => {
  // definitions
  const data = files[0]!
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { id: data.id },
    user: users.user,
  })

  // mocks
  u.mockPrismaForIdDelete(context, "file")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testIdFails(context)
    u.testAuthFail(context, [users.unverified, users.mod, users.admin])
  }
})
