import { describe, expect, expectTypeOf, it, vi } from "vitest"
import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import type { ExperimentSection } from "@prisma/client"
import listExperimentSections from "~~/server/api/experiments/sections/index.get"
import type { ExperimentSectionList } from "~~/shared/types/ExperimentSection.type"
import slugify from "~~/server/utils/slugify"

describe("Api Route GET /api/experiments/sections", async () => {
  it("should return a list of legal documents", async () => {
    const sections = [
      "Versuchsziel",
      "Material",
      "Versuchsaufbau",
      "Durchführung",
      "Beobachtung",
      "Ergebnis",
      "Tipps und Tricks",
    ].map((section, index) => ({
      id: uuidv4(),
      name: section,
      slug: slugify(section),
      order: index,
    })) as ExperimentSection[]

    prisma.experimentSection.findMany = vi.fn().mockResolvedValue(sections)

    const event = {} as unknown as H3Event<EventHandlerRequest>

    const response = await listExperimentSections(event)

    expectTypeOf(response).toEqualTypeOf<ExperimentSectionList[]>()
    expect(response).toStrictEqual(sections)
  })
})
