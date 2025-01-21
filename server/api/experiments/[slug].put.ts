import { readValidatedBody } from "h3"
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

  const updatedExperimentData = await readValidatedBody(
    event,
    async body => (await getExperimentSchema()).parseAsync(body),
  )

  const updatedExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.update({
        where: { id: experiment.id },
        data: {
          name: updatedExperimentData.name,
          slug: slug,
          duration: updatedExperimentData.duration,
          sections: {
            update: await Promise.all(
              updatedExperimentData.sections.map(async section => ({
                where: {
                  id: (await prisma.experimentSectionContent.findFirst({
                    where: {
                      experimentId: experiment.id,
                      experimentSection: {
                        order: section.experimentSectionPositionInOrder,
                      },
                    },
                  }))!.id,
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
              })),
            ),
          },
          attributes: {
            set: [],
            connect: updatedExperimentData.attributes.map(attribute => ({
              id: attribute.valueId,
            })),
          },
        },
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
