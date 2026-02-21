import { describe, expectTypeOf } from "vitest"
import { lists, listsDb } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/index.get"

describe("Api Route /api/experiments/index.get", () => {
  type Result = EndpointResult<typeof endpoint>

  const data = listsDb.map(exp => ({
    ...exp,
    signs: [],
  }))

  const expected: Result = u.page(
    lists.map(exp => ({
      ...exp,
      previewImage: exp.previewImage ?? undefined,
      signs: [] as Result["items"][number]["signs"],
      isFavorited: false,
      favoriteNumberForSequence: undefined,
    })),
  )

  const context = u.getTestContext({
    data,
    expected,
    endpoint,
    user: users.guest,
  })

  u.mockPrismaForGetAll(context, "experiment")

  expectTypeOf<Result>().toEqualTypeOf<typeof expected>()

  u.testSuccessWithPagination(context, lists)
})
