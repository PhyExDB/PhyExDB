import { describe, expect, vi, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import getAttribute from "~~/server/api/experiments/attributes/[id].get"

describe("Api Route GET /api/experiments/attributes/{id}", () => {
  it("should get an Attribute by id", async () => {
    const mockAttribute = {
      id: uuidv4(),
      name: "Test Attribute",
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

    expect(response).toStrictEqual({
      id: mockAttribute.id,
      name: mockAttribute.name,
      valueList: ["Value 1", "Value 2"],
    })
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
