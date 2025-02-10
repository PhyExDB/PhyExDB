import { describe, expect, it } from "vitest"
import * as u from "~~/tests/helpers/utils"

describe("Test mocking event", async () => {
  it("param", () => {
    const query = { id: "123" }
    expect(getQuery(u.getEvent({ query }))).toStrictEqual(query)
  })

  it("body", async () => {
    const body = { id: "123" }
    expect(await readValidatedBody(u.getEvent({ body }), b => b)).toStrictEqual(body)
  })

  it("params", () => {
    const params = { id: "123" }
    expect(getRouterParam(u.getEvent({ params }), "id")).toStrictEqual(params.id)
  })
})
