import { describe, expect, it } from "vitest"

import * as unit from "~~/server/utils/utils"

describe("Test utils", async () => {
  it("nullTo404", async () => {
    expect(await unit.nullTo404(async () => "result")).toEqual("result")
    expect(unit.nullTo404(async () => null)).rejects.toThrow(expect.objectContaining({ statusCode: 404 }))
  })
})
