import { readValidatedBody } from "h3"
import type { Prisma } from "@prisma/client"
import type { ExperimentDetail } from "~~/shared/types"
import { getExperimentSchema } from "~~/shared/types"
import { getSlugOrIdPrismaWhereClause, untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"

export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: experimentIncludeForToList,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  }

  const user = await getUser(event)
  if (user == null) {
    throw createError({ statusCode: 401, statusMessage: "No user is logged in" })
  }
  await authorize(event, canEditExperiment, experiment)

  const sections = await $fetch("/api/experiments/sections")
  const attributes = await $fetch("/api/experiments/attributes")

  const updatedExperimentData = await readValidatedBody(
    event,
    async body => (getExperimentSchema(sections, attributes)).parseAsync(body),
  )

  function experimentData(slug: string) {
    const data: Prisma.ExperimentUpdateInput = {
      name: updatedExperimentData.name,
      slug: slug,
      duration: updatedExperimentData.duration[0]!,
      sections: {
        update: updatedExperimentData.sections.map(section => ({
          where: {
            id: section.experimentSectionId,
          },
          data: {
            text: section.text,
            files: {
              set: [], // now there might be files that are not used in any experiment
              connect: section.files.map(file => ({
                id: file.fileId,
              })),
            },
          },
        }),
        ),
      },
      attributes: {
        set: [],
        connect: updatedExperimentData.attributes.map(attribute => ({
          id: attribute.valueId,
        })),
      },
    }

    if (updatedExperimentData.previewImageId) {
      data["previewImage"] = {
        connect: {
          id: updatedExperimentData.previewImageId,
        },
      }
    }

    return data
  }

  const updatedExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.update({
        where: { id: experiment.id },
        data: experimentData(slug),
        include: experimentIncludeForToDetail,
      })
    },
    slugify(updatedExperimentData.name),
  )

  return updatedExperiment as ExperimentDetail
})

defineRouteMeta({
  openAPI: {
    description: "Updates an experiment",
    tags: ["Experiment"],
    requestBody: {
      description: "Experiment data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              duration: { type: "number" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    experimentSectionPositionInOrder: { type: "number" },
                    text: { type: "string" },
                    files: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          fileId: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
              attributes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    valueId: { type: "string" },
                  },
                },
              },
            },
            required: ["name", "duration", "sections", "attributes"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Experiment updated successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                slug: { type: "string" },
                userId: { type: "string", format: "uuid" },
                status: {
                  type: "string",
                  enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"],
                },
                duration: { type: "number" },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      text: { type: "string" },
                      order: { type: "number" },
                      files: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            fileId: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
                attributes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
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
        description: "No user is logged in",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
