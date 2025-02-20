import type { Prisma } from "@prisma/client"
import { getSlugOrIdPrismaWhereClause, untilSlugUnique } from "~~/server/utils/prisma"
import slugify from "~~/server/utils/slugify"
import { experimentAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: experimentIncludeForToList,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  }

  await authorize(event, experimentAbilities.put, experiment)

  const sections = await $fetch("/api/experiments/sections")
  const attributes = await $fetch("/api/experiments/attributes")

  const updatedExperimentData = await readValidatedBody(
    event,
    async body => (getExperimentSchema(sections, attributes)).parseAsync(body),
  )

  const sanitizedExperimentData = {
    ...updatedExperimentData,
    sections: updatedExperimentData.sections.map(section => ({
      ...section,
      text: sanitizeHTML(section.text),
      files: section.files,
    })),
  }

  function experimentData(slug: string) {
    const data: Prisma.ExperimentUpdateInput = {
      name: sanitizedExperimentData.name,
      slug: slug,
      duration: sanitizedExperimentData.duration[0]!,
      sections: {
        update: sanitizedExperimentData.sections.map(section => ({
          where: {
            id: section.experimentSectionContentId,
          },
          data: {
            text: section.text,
            files: {
              upsert: section.files.map((file, index) => ({
                where: {
                  id: file.fileId,
                },
                update: {
                  description: file.description,
                  order: index,
                },
                create: {
                  description: file.description,
                  order: index,
                  file: {
                    connect: {
                      id: file.fileId,
                    },
                  },
                },
              })),
            },
          },
        })),
      },
      attributes: {
        set: [],
        connect: sanitizedExperimentData.attributes
          .flatMap(attribute => attribute.valueIds)
          .filter(valueId => valueId != undefined)
          .map(valueId => ({
            id: valueId,
          })),
      },
    }

    if (sanitizedExperimentData.previewImageId) {
      data["previewImage"] = {
        connect: {
          id: sanitizedExperimentData.previewImageId,
        },
      }
    }

    return data
  }

  const updatedExperiment = await untilSlugUnique(
    async (slug: string) => {
      const [_, newExperiment] = await prisma.$transaction([
        prisma.experimentFile.deleteMany({
          where: {
            experimentSection: {
              experiment: {
                id: experiment.id,
              },
            },
          },
        }),
        prisma.experiment.update({
          where: { id: experiment.id },
          data: experimentData(slug),
          include: experimentIncludeForToDetail,
        }),
      ])
      return newExperiment
    },
    slugify(sanitizedExperimentData.name),
  )

  return mapExperimentToDetail(updatedExperiment as ExperimentIncorrectDetail)
})

defineRouteMeta({
  openAPI: {
    description: "Updates an experiment",
    tags: ["Experiment"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The id or slug of the experiment to update",
        schema: {
          type: "string",
        },
      },
    ],
    requestBody: {
      description: "the updated experiment data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              duration: { type: "number" },
              previewImageId: { type: "string" },
              attributes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    values: {
                      type: "array",
                      items: { type: "string", format: "uuid" },
                    },
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
                previewImageId: { type: "string", format: "uuid" },
                revisedBy: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    slug: { type: "string" },
                    userId: { type: "string", format: "uuid" },
                    status: { type: "string", enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"] },
                    duration: { type: "number" },
                    previewImageId: { type: "string", format: "uuid" },
                    revisionOfId: { type: "string", format: "uuid" },
                    changeRequest: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
                revisionOfId: { type: "string", format: "uuid" },
                changeRequest: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                attributes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      slug: { type: "string" },
                      name: { type: "string" },
                      order: { type: "number" },
                      multipleSelection: { type: "boolean" },
                      values: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            slug: { type: "string" },
                            value: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      text: { type: "string" },
                      files: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            description: { type: "string" },
                            order: { type: "number" },
                            file: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                mimeType: { type: "string" },
                                path: { type: "string" },
                                originalName: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                      experimentSection: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          slug: { type: "string" },
                          name: { type: "string" },
                          order: { type: "number" },
                        },
                      },
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
