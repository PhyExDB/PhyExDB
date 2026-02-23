import { describe, expectTypeOf, vi } from "vitest"
import { detailDb } from "../data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/submit/[id].post"

describe("Api Route /api/experiments/submit/[id].post", () => {
  // definitions
  const sections: ExperimentSectionList[] = []
  const attributes: ExperimentAttributeDetail[] = []

  const data = {
    ...detailDb,
    sections: [],
    attributes: [],
  }
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { id: data.id },
    user: users.user,
  })

  // mocks
  u.mockPrismaForIdPut({ data: data, expected: data }, "experiment")
  vi.stubGlobal("$fetch", async (path: string) => {
    if (path === "/api/experiments/sections") {
      return sections
    } else if (path === "/api/experiments/attributes") {
      return attributes
    }
  })

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
