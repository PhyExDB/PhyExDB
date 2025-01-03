import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import addValue from "~~/server/api/experiments/attributes/[id].post"
import { experimentAttributeValueResultExtensions } from "~~/server/db/models/experimentAttributeValue"
import { experimentAttributeResultExtensions } from "~~/server/db/models/experimentAttribute"

describe("API Route POST /api/experiments/attributes/{id}", () => {
  it("should add an value successfully", async () => {
    const mockAttributeValue = {
      id: uuidv4(),
      name: "Value 1",
      toList: () => experimentAttributeValueResultExtensions.toList.compute(mockAttributeValue)(),
    }
    const mockAttribute = {
      id: uuidv4(),
      name: "name",
      slug: "name",
      values: [mockAttributeValue],
      toDetail: (values: [ExperimentAttributeValueList]) => experimentAttributeResultExtensions.toDetail.compute(mockAttribute)(values),
    }
    prisma.experimentAttribute.findFirst = vi.fn().mockImplementation(({ where }) => {
      if (where.id === mockAttribute.id) {
        return Promise.resolve(mockAttribute)
      }
      return Promise.resolve(null)
    })
    const addContent = {
      id: uuidv4(),
      name: "New Value",
      toList: () => experimentAttributeValueResultExtensions.toList.compute(addContent)(),
    }
    prisma.experimentAttributeValue.create = vi.fn().mockResolvedValue(addContent)
    const event = {
      context: {
        params: { id: mockAttribute.id },
      },
      body: addContent,
    } as unknown as H3Event

    const response = await addValue(event)

    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeDetail>()
    const { toDetail, values, ...rest } = mockAttribute
    const finalValues = [...values, addContent].map((value) => {
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

    await expect(addValue(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid id",
      }),
    )
  })
  it("should return a 404 error if the attribute is not found", async () => {
    prisma.experimentAttribute.findFirst = vi.fn().mockResolvedValue(null)

    const event = {
      context: {
        params: {
          id: uuidv4(),
        },
      },
    } as unknown as H3Event

    await expect(addValue(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        message: "Attribute not found",
      }),
    )
  })
})
