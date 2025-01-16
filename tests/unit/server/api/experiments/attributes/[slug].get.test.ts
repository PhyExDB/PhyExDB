import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import getAttribute from "~~/server/api/experiments/attributes/[slug].get"
import { experimentAttributeResultExtensions } from "~~/server/db/models/experimentAttribute"

describe("Api Route GET /api/experiments/attributes/{slug}", () => {
  it("should get an Attribute by id", async () => {
    const value_1 = {
      id: uuidv4(),
      value: "value_one",
      slug: "value_one",
    }
    const value_2 = {
      id: uuidv4(),
      value: "value_two",
      slug: "value_two",
    }
    const attribute = {
      id: uuidv4(),
      name: "attribute_one",
      slug: "test",
      values: [value_1, value_2],
    }

    const expected = attribute
    const mockAttribute = {
      ...attribute,
      toDetail: () => experimentAttributeResultExtensions.toDetail.compute(mockAttribute)([value_1, value_2]),
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
          slug: mockAttribute.id,
        },
      },
    } as unknown as H3Event<EventHandlerRequest>

    const response = await getAttribute(event)

    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeDetail>()
    expect(response).toStrictEqual(expected)
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
        message: "Invalid slug",
      }),
    )
  })

  it("should return a 404 error if the attribute is not found", async () => {
    // Mocking Prisma to return null
    prisma.experimentAttribute.findFirst = vi.fn().mockResolvedValue(null)

    const event = {
      context: {
        params: {
          slug: uuidv4(),
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
