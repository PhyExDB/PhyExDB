import { describe, expect, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import updateAttributeValue from "~~/server/api/experiments/attributes/values/[id].put"

describe("API Route PUT /api/experiments/attributes/{id}", () => {
  it("should update an attribute value name successfully", async () => {
    const mockAttributeValue = {
      id: uuidv4(),
      name: "OldName",
      toDetail: () => ({
        id: mockAttributeValue.id,
        name: mockAttributeValue.name,
      }),
    }

    prisma.experimentAttributeValue.findFirst = vi.fn().mockImplementation(({ where }) => {
      if (where.id === mockAttributeValue.id) {
        return Promise.resolve(mockAttributeValue)
      }
      return Promise.resolve(null)
    })
    const updateContent = {
      name: "NewName",
    }
    prisma.experimentAttributeValue.update = vi.fn().mockResolvedValue({
      id: mockAttributeValue.id,
      name: updateContent.name,
      toDetail: () => ({
        id: mockAttributeValue.id,
        name: updateContent.name,
      }),
    })
    const event = {
      context: {
        params: {
          id: mockAttributeValue.id,
        },
      },
      body: updateContent,
    } as unknown as H3Event

    const response = await updateAttributeValue(event)

    expect(response).toStrictEqual({
      id: mockAttributeValue.id,
      name: updateContent.name,
    })
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
        message: "Invalid id",
      }),
    )
  })

  it("should return a 404 error if the value is not found", async () => {
    prisma.experimentAttributeValue.findFirst = vi.fn().mockResolvedValue(null)

    const event = {
      context: {
        params: {
          id: uuidv4(),
        },
      },
    } as unknown as H3Event

    await expect(updateAttributeValue(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        message: "Value not found",
      }),
    )
  })
})
