import { describe, expect, vi, it, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import type { H3Event } from "h3"
import updateAttribute from "~~/server/api/experiments/attributes/[slug].put"
import { mockUser, users } from "~~/tests/helpers/auth"

mockUser(users.admin)

describe("API Route PUT /api/experiments/attributes/{slug}", () => {
  it("should update an Attribute name successfully", async () => {
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
    const updateContent = {
      name: "Newname",
    }

    prisma.experimentAttribute.update = vi.fn().mockResolvedValue(
      attribute,
    )
    const event = {
      context: {
        params: {
          slug: attribute.id,
        },
      },
      body: updateContent,
    } as unknown as H3Event

    const response = await updateAttribute(event)
    expectTypeOf(response).toEqualTypeOf<ExperimentAttributeDetail>()
    expect(response).toStrictEqual(attribute)
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
        message: "Invalid slug",
      }),
    )
  })

  it("should return a 404 error if the attribute is not found", async () => {
    const event = {
      context: {
        params: {
          slug: uuidv4(),
        },
      },
      body: {
        name: "Newname",
      },
    } as unknown as H3Event

    prisma.experimentAttribute.update = vi.fn().mockResolvedValue(
      null,
    )

    await expect(updateAttribute(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        message: "Attribute not found",
      }),
    )
  })
})
