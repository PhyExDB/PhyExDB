import { describe, expect, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import updateAttribute from "~~/server/api/experiments/attributes/[id].put"

describe("API Route PUT /api/experiments/attributes/{id}", () => {
  it("should update an Attribute name successfully", async () => {
    const mockAttribute = {
      id: uuidv4(),
      name: "OldName",
      values: [
        { id: uuidv4(), value: "Value 1", toList: () => "Value 1" },
        { id: uuidv4(), value: "Value 2", toList: () => "Value 2" },
      ],
      toDetail: (valueList: string[]) => ({
        id: mockAttribute.id,
        name: mockAttribute.name,
        valueList,
      }),
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
      toDetail: (valueList: string[]) => ({
        id: mockAttribute.id,
        name: updateContent.name,
        valueList,
      }),
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

    expect(response).toStrictEqual({
      id: mockAttribute.id,
      name: updateContent.name,
      valueList: ["Value 1", "Value 2"],
    })
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
