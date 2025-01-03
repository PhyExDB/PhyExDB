import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import updateAttribute from "~~/server/api/experiments/attributes/[id].put"
import { experimentAttributeResultExtensions } from "~~/server/db/models/experimentAttribute"
import { experimentAttributeValueResultExtensions } from "~~/server/db/models/experimentAttributeValue"

describe("API Route PUT /api/experiments/attributes/{id}", () => {
  it("should update an Attribute name successfully", async () => {
    const value1 = {
      id: uuidv4(),
      name: "Value 1",
      toList: () =>
        experimentAttributeValueResultExtensions.toList.compute(value1)(),
    }
    const value2 = {
      id: uuidv4(),
      name: "Value 2",
      toList: () =>
        experimentAttributeValueResultExtensions.toList.compute(value2)(),
    }
    const mockAttribute = {
      id: uuidv4(),
      name: "OldName",
      slug: "slug",
      values: [value1, value2],
      toDetail: (values: [ExperimentAttributeValueList]) =>
        experimentAttributeResultExtensions.toDetail.compute(mockAttribute)(values),
    }

    // Mocking Prisma findFirst and update methods
    prisma.experimentAttribute.findFirst = vi.fn().mockImplementation(({ where }) => {
      if (where.id === mockAttribute.id) {
        return Promise.resolve(mockAttribute)
      }
      return Promise.resolve(null)
    })
    const updateContent = {
      name: "Newname",
    }
    prisma.experimentAttribute.update = vi.fn().mockResolvedValue({
      id: mockAttribute.id,
      name: updateContent.name,
      toDetail: (values: [ExperimentAttributeList]) =>
        experimentAttributeResultExtensions.toDetail.compute(mockAttribute)(values),
    })
    const event = {
      context: {
        params: {
          id: mockAttribute.id,
        },
      },
      body: updateContent,
    } as unknown as H3Event

    const response = await updateAttribute(event)
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

    await expect(updateAttribute(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 400,
        message: "invalid id",
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

    await expect(updateAttribute(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        message: "Attribute not found",
      }),
    )
  })
})
