import { describe, expect, it } from "vitest"
import * as u from "~~/tests/helpers/utils"

import * as unit from "~~/server/utils/pagination"

describe("Test utils pagination", async () => {
  it("getPageMeta", () => {
    expect(unit.getPageMeta(u.getEvent({}), 100)).toMatchObject({
      page: 1,
      pageSize: 12,
      totalPages: 9,
      total: 100,
    })
    expect(unit.getPageMeta(u.getEvent({ query: { page: 2, pageSize: 10 } }), 100)).toMatchObject({
      page: 2,
      pageSize: 10,
      totalPages: 10,
      total: 100,
    })
  })
  it("getPaginationPrismaParam", () => {
    expect(unit.getPaginationPrismaParam({
      page: 1,
      pageSize: 12,
    })).toMatchObject({
      skip: 0,
      take: 12,
    })
    expect(unit.getPaginationPrismaParam({
      page: 2,
      pageSize: 3,
    })).toMatchObject({
      skip: 3,
      take: 3,
    })
  })
})
