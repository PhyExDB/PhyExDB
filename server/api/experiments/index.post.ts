import { v4 as uuidv4 } from "uuid"
import { experimentAbilities } from "~~/shared/utils/abilities"
import { untilSlugUnique } from "~~/server/utils/prisma"
import { authorizeUser } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.post)

  const sections = await $fetch("/api/experiments/sections")
  const slug = uuidv4()

  const newExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.create({
        data: {
          name: "",
          slug: slug,
          duration: 20,
          user: {
            connect: {
              id: user!.id,
            },
          },
          sections: {
            create: sections.map(section => ({
              text: "",
              experimentSection: {
                connect: {
                  id: section.id,
                },
              },
            })),
          },
        },
        include: experimentIncludeForToDetail,
      })
    },
    slugify(slug),
  )

  setResponseStatus(event, 201)
  return mapExperimentToDetail(newExperiment as ExperimentIncorrectDetail)
})

defineRouteMeta({
  openAPI: {
    description: "Creates a new experiment.",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "Experiment created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                slug: { type: "string" },
                userId: { type: "string" },
                status: {
                  type: "string",
                  enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"],
                },
                duration: { type: "number" },
                attributes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      id: { type: "string", format: "uuid" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid experiment data",
      },
      401: {
        description: "Unauthorized",
      },
    },
  },
})
