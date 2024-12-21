import { describe, expect, expectTypeOf, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import { experimentAttributeValueResultExtensions } from "~~/server/db/models/experimentAttributeValue"
import { experimentAttributeResultExtensions } from "~~/server/db/models/experimentAttribute"
import listAttributes from "~~/server/api/experiments/attributes/index.get"

describe("Api Route GET /api/experiments/attributes", async () => {
  it("should return a list of Attributes and their Values", async () => {
    const value_1 = {
      id: uuidv4(),
      name: "value_one",
      toList: () => experimentAttributeValueResultExtensions.toList.compute(value_1)(),
    }
    const value_2 = {
      id: uuidv4(),
      name: "value_two",
      toList: () => experimentAttributeValueResultExtensions.toList.compute(value_2)(),
    }
    const attribute_one = {
      id: uuidv4(),
      name: "attribute_one",
      slug: "test",
      values: [value_1, value_2],
      toDetail: () => experimentAttributeResultExtensions.toDetail.compute(attribute_one)([value_1, value_2]),

    }
    const mockAttribute = [attribute_one]
    prisma.experimentAttribute.findMany = vi.fn().mockResolvedValue(mockAttribute)
    const event = {} as unknown as H3Event<EventHandlerRequest>
    const response = await listAttributes(event)

    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeDetail[]>()
    expect(response).toStrictEqual(mockAttribute.map(({ toDetail, ...rest }) => ({ ...rest })))
  })
})
