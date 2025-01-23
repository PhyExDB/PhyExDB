import { readValidatedBody } from "h3"
import type { Prisma } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { getExperimentSchema } from "~~/shared/types"
import { canCreateExperiment } from "~~/shared/utils/abilities"
import { untilSlugUnique } from "~~/server/utils/utils"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  await authorize(event, canCreateExperiment)
  if (user == null) {
    throw createError({ statusCode: 401, statusMessage: "No user is logged in" })
  }

  const sections = await $fetch("/api/experiments/sections")
  const attributes = await $fetch("/api/experiments/attributes")

  const newValueContent = await readValidatedBody(
    event,
    async body => (getExperimentSchema(sections, attributes)).optional().parseAsync(body),
  )

  function experimentData(slug: string) {
    if (!newValueContent) {
      return {
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
      }
    }
    const data: Prisma.ExperimentCreateInput = {
      name: newValueContent.name,
      slug: slug,
      duration: newValueContent.duration[0]!,
      user: {
        connect: {
          id: user!.id,
        },
      },
      sections: {
        create: newValueContent.sections.map(section => ({
          text: section.text,
          experimentSection: {
            connect: {
              id: section.experimentSectionContentId,
            },
          },
          ...(section.files.length > 0 && {
            connect: section.files.map(file => ({
              id: file.fileId,
            })),
          }),
        })),
      },
      attributes: {
        connect: newValueContent.attributes
          .filter(attribute => attribute.valueId !== undefined)
          .map(attribute => ({
            id: attribute.valueId,
          })),
      },
    }

    if (newValueContent.previewImageId) {
      data["previewImage"] = {
        connect: {
          id: newValueContent.previewImageId,
        },
      }
    }

    return data
  }

  let slug: string
  if (newValueContent?.name && newValueContent.name.length > 0) {
    slug = slugify(newValueContent.name)
  } else {
    slug = uuidv4()
  }

  const newExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.create({
        data: experimentData(slug),
        include: experimentIncludeForToDetail,
      })
    },
    slugify(slug),
  )

  setResponseStatus(event, 201)
  return newExperiment as ExperimentDetail
})

defineRouteMeta({
  openAPI: {
    description: "Creates a new experiment.",
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
