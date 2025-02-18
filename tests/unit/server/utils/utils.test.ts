import { describe, expect, expectTypeOf, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import * as u from "~~/tests/helpers/utils"

import * as unit from "~~/server/utils/utils"

describe("Test utils", async () => {
  it("nullTo404", async () => {
    expect(await unit.nullTo404(async () => "result")).toEqual("result")
    expect(unit.nullTo404(async () => null)).rejects.toThrow(expect.objectContaining({ statusCode: 404 }))
  })
})
