import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import updateAttributeValue from "~~/server/api/experiments/attributes/values/[slug].put"
import { experimentAttributeValueResultExtensions } from "~~/server/db/models/experimentAttributeValue"

describe("API Route PUT /api/experiments/attributes/{id}", () => {
  it("should update an attribute value name successfully", async () => {
    const mockAttributeValue = {
      id: uuidv4(),
      value: "OldName",
      slug: "oldname",
      toList: () =>
        experimentAttributeValueResultExtensions.toList.compute(mockAttributeValue)(),
    }

    prisma.experimentAttributeValue.findFirst = vi.fn().mockImplementation(({ where }) => {
      if (where.id === mockAttributeValue.id) {
        return Promise.resolve(mockAttributeValue)
      }
      return Promise.resolve(null)
    })
    const updateContent = {
      value: "NewName",
    }
    prisma.experimentAttributeValue.update = vi.fn().mockResolvedValue({
      id: mockAttributeValue.id,
      value: updateContent.value,
      toList: () =>
        experimentAttributeValueResultExtensions.toList.compute(mockAttributeValue)(),
    })
    const event = {
      context: {
        params: {
          slug: mockAttributeValue.id,
        },
      },
      body: updateContent,
    } as unknown as H3Event

    const response = await updateAttributeValue(event)
    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeValueList>()
    const { toList, ...rest } = mockAttributeValue
    expect(response).toStrictEqual({ ...rest })
  })
  it("should return a 400 error if no id is provided", async () => {
    const event = {
      context: {
        params: {},
      },
    } as unknown as H3Event

    await expect(updateAttributeValue(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 400,
        message: "Invalid slug",
      }),
    )
  })

  it("should return a 404 error if the value is not found", async () => {
    const event = {
      context: {
        params: {
          slug: uuidv4(),
        },
      },
      body: {
        value: "newValue",
      },
    } as unknown as H3Event

    prisma.experimentAttributeValue.update = vi.fn().mockResolvedValue(
      null,
    )

    await expect(updateAttributeValue(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        message: "Value not found",
      }),
    )
  })
})
