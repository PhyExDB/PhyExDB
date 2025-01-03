import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import getAttribute from "~~/server/api/experiments/attributes/[id].get"
import { experimentAttributeResultExtensions } from "~~/server/db/models/experimentAttribute"
import { experimentAttributeValueResultExtensions } from "~~/server/db/models/experimentAttributeValue"

describe("Api Route GET /api/experiments/attributes/{id}", () => {
  it("should get an Attribute by id", async () => {
    const mockValue1 = {
      id: uuidv4(),
      name: "Value1",
      toList: () =>
        experimentAttributeValueResultExtensions.toList.compute(mockValue1)(),
    }
    const mockValue2 = {
      id: uuidv4(),
      name: "Value2",
      toList: () =>
        experimentAttributeValueResultExtensions.toList.compute(mockValue2)(),
    }

    const mockAttribute = {
      id: uuidv4(),
      name: "Test Attribute",
      slug: "slug",
      values: [mockValue1, mockValue2],
      toDetail: (values: [ExperimentAttributeList]) =>
        experimentAttributeResultExtensions.toDetail.compute(mockAttribute)(values),
    }

    // Mocking Prisma
    prisma.experimentAttribute.findFirst = vi.fn().mockImplementation(({ where }) => {
      if (where.id === mockAttribute.id) {
        return Promise.resolve(mockAttribute)
      }
      return Promise.resolve(null)
    })

    const event = {
      context: {
        params: {
          id: mockAttribute.id,
        },
      },
    } as unknown as H3Event<EventHandlerRequest>

    const response = await getAttribute(event)

    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeDetail>()
    const { toDetail, values, ...rest } = mockAttribute
    const finalValues = [...values].map((value) => {
      const { toList, ...rest } = value
      return rest
    })
    expect(response).toStrictEqual({ ...rest, values: finalValues })
  })
  it("should return a 400 error if no id is provided", async () => {
    const event = {
      context: {
        params: {},
      },
    } as unknown as H3Event

    await expect(getAttribute(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 400,
        message: "invalid id",
      }),
    )
  })

  it("should return a 404 error if the attribute is not found", async () => {
    // Mocking Prisma to return null
    prisma.experimentAttribute.findFirst = vi.fn().mockResolvedValue(null)

    const event = {
      context: {
        params: {
          id: uuidv4(),
        },
      },
    } as unknown as H3Event

    await expect(getAttribute(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        message: "Attribute not found",
      }),
    )
  })
})
