import { describe, expectTypeOf } from "vitest"
import { lists } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/users/index.get"

describe("Api Route GET /api/users/index", () => {
  // definitions
  const data = lists
  const expected = u.page(data)

  const context = u.getTestContext({
    data, expected, endpoint,

    user: users.admin,
  })

  // mocks
  u.mockPrismaForGetAll(context, "user")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithPagination(context, data)

    it("search by name", async () => {
      const c = u.extendContext(context,
        {
          query: { search: "user" },
          expected: u.page(
            data
              .filter(user => user.name.includes("user"))
              .map(user => ({ ...user, banned: false })),
          ),
        },
      )
      u.expectSuccess(c)
    })
    it("search by id", async () => {
      const c = u.extendContext(context,
        {
          query: { search: users.user.id },
          expected: u.page(
            [users.user]
              .map(user => ({ ...user, banned: false })),
          ),
        },
      )
      u.expectSuccess(c)
    })
    it("search by role", async () => {
      {
        const c = u.extendContext(context,
          {
            query: { search: "moderator" },
            expected: u.page(
              [users.mod]
                .map(user => ({ ...user, banned: false })),
            ),
          },
        )
        u.expectSuccess(c)
      }
      {
        const c = u.extendContext(context,
          {
            query: { search: "admin" },
            expected: u.page(
              [users.admin]
                .map(user => ({ ...user, banned: false })),
            ),
          },
        )
        u.expectSuccess(c)
      }
    })
  }
})
