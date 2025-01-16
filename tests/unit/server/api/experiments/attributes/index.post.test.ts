import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import addValue from "~~/server/api/experiments/attributes/index.post"
import { experimentAttributeResultExtensions } from "~~/server/db/models/experimentAttribute"

describe("API Route POST /api/experiments/attributes", () => {
  it("should add an value successfully", async () => {
    const mockAttributeValue = {
      id: uuidv4(),
      value: "Value 1",
      slug: "value-1",
    }
    const mockAttribute = {
      id: uuidv4(),
      name: "name",
      slug: "name",
      values: [mockAttributeValue],
      toDetail: (values: [ExperimentAttributeValueList]) => experimentAttributeResultExtensions.toDetail.compute(mockAttribute)(values),
    }
    const addContent = {
      name: "New Value",
      values: ["a", "b"],
    }

    prisma.experimentAttribute.create = vi.fn().mockResolvedValue(
      mockAttribute,
    )
    const event = {
      body: addContent,
    } as unknown as H3Event

    const response = await addValue(event)

    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeDetail>()
    const { toDetail, ...expected } = mockAttribute
    expect(response).toStrictEqual(expected)
  })
})
