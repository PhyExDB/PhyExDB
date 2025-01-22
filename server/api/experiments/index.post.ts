import { readValidatedBody } from "h3"
import type { Prisma } from "@prisma/client"
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
    async body => (getExperimentSchema(sections, attributes)).parseAsync(body),
  )

  function experimentData(slug: string) {
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
              id: section.experimentSectionId,
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
        connect: newValueContent.attributes.map(attribute => ({
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

  const newExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.create({
        data: experimentData(slug),
        include: experimentIncludeForToDetail,
      })
    },
    slugify(newValueContent.name),
  )

  setResponseStatus(event, 201)
  return newExperiment as ExperimentDetail
})

defineRouteMeta({
  openAPI: {
    description: `Creates a new experiment.
                  The experiment must contain sections with position 0 until 6 (included)
                  and at least one attribute value for each attribute.
                  Only logged in users can create experiments.`,
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
