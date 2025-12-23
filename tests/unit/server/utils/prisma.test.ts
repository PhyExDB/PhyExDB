import { describe, expect, expectTypeOf, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import * as u from "#tests/helpers/utils"

import * as unit from "~~/server/utils/prisma"
import {PrismaClientKnownRequestError} from "../../../../generated/prisma/internal/prismaNamespace";

describe("Test utils prisma", async () => {
  it("getSlugOrIdPrismaWhereClause", async () => {
    expectTypeOf<ReturnType<typeof unit.getSlugOrIdPrismaWhereClause>>()
      .toEqualTypeOf<{ slug: string } | { id: string }>()
    const id = uuidv4()
    expect(unit.getSlugOrIdPrismaWhereClause(u.getEvent({ params: { slug: id } })))
      .toMatchObject({ id })
    expect(unit.getSlugOrIdPrismaWhereClause(u.getEvent({ params: { slug: "slug" } })))
      .toMatchObject({ slug: "slug" })
    expect(() => unit.getSlugOrIdPrismaWhereClause(u.getEvent({}))).toThrowError("Invalid slug")
  })

  it("getIdPrismaWhereClause", async () => {
    const id = "id"
    const res = unit.getIdPrismaWhereClause(u.getEvent({ params: { id } }))
    expectTypeOf(res).toEqualTypeOf<{ id: string }>()
    expect(res).toEqual({ id })
    expect(() => unit.getIdPrismaWhereClause(u.getEvent({}))).toThrowError("Invalid id")
  })

  {
    const error = new PrismaClientKnownRequestError("", {
      code: "P2002",
      meta: { target: ["slug"] },
      clientVersion: "test",
    })

    it("catchPrismaUniqueError", async () => {
      expect(await unit.catchPrismaUniqueError(async () => "result", "slug")).toEqual("result")
      expect(error instanceof PrismaClientKnownRequestError).toBeTruthy()
      expect(await unit.catchPrismaUniqueError(async () => {
        throw error
      }, "slug")).toEqual("NOTUNIQUE")
      await expect(unit.catchPrismaUniqueError(async () => {
        throw new Error()
      }, "attribute")).rejects.toThrowError()
    })

    it("untilSlugUnique", async () => {
      expect(await unit.untilSlugUnique(async () => "result", "slug")).toEqual("result")
      expect(await unit.untilSlugUnique(async (slug) => {
        if (slug === "slug3") {
          return slug
        }
        throw error
      }, "slug")).toEqual("slug3")
    })
  }

  {
    const error = new PrismaClientKnownRequestError("", {
      code: "P2025",
      meta: {},
      clientVersion: "test",
    })
    it("prismaRecordNotFoundTo404", async () => {
      expect(await unit.prismaRecordNotFoundTo404(async () => "result")).toEqual("result")
      await expect(unit.prismaRecordNotFoundTo404(async () => {
        throw error
      })).rejects.toThrow(expect.objectContaining({ statusCode: 404 }))
    })
  }
})
