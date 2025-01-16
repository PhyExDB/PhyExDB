import { readValidatedBody } from "h3"
import { validate as uuidValidate } from "uuid"
import { getUniqueSlugForExperiment } from "~~/server/utils/experiment"
import { getExperimentSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const slugOrId = getRouterParam(event, "slug")
  if (!slugOrId) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const isId = uuidValidate(slugOrId)
  const whereClause = isId ? { id: slugOrId } : { slug: slugOrId }
  const experiment = await prisma.experiment.findFirst({
    where: whereClause,
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

  const slug = await getUniqueSlugForExperiment(updatedExperimentData.name, experiment.id)

  const updatedExperiment = await prisma.experiment.update({
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
  })

  return await updatedExperiment.toDetail()
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
