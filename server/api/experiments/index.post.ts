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
    requestBody: {
      description: "the experiment data",
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
                    values: {
                      type: "array",
                      items: { type: "string", format: "uuid" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
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
                previewImageId: { type: "string", format: "uuid" },
                revisionOfId: { type: "string", format: "uuid" },
                changeRequest: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                previewImage: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    originalName: { type: "string" },
                    path: { type: "string" },
                    mimeType: { type: "string" },
                    createdById: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
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
                revisionOf: {
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
                            id: { type: "string", format: "uuid" },
                            mimeType: { type: "string" },
                            path: { type: "string" },
                            originalName: { type: "string" },
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
      403: {
        description: "Unauthorized",
      },
    },
  },
})
