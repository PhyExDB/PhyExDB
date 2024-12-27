import { readValidatedBody } from "h3"
import { getExperimentCreateSchema } from "~~/shared/types"
import { canCreateExperiment } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  await authorize(event, canCreateExperiment)
  if (user == null) {
    throw createError({ statusCode: 401, statusMessage: "No user is logged in" })
  }

  const newValueContent = await readValidatedBody(event, async body => (await getExperimentCreateSchema()).parse(body))

  const newExperiment = await prisma.experiment.create({
    data: {
      name: newValueContent.name,
      slug: slugify(newValueContent.name),
      duration: newValueContent.duration,
      userId: user.id,
      sections: {
        create: await Promise.all(newValueContent.sections.map(async section => ({
          text: section.text,
          experimentSection: {
            connect: {
              id: (
                await prisma.experimentSection.findFirst({
                  where: {
                    order: section.experimentSectionPositionInOrder,
                  },
                })
              )!.id,
            },
          },
          connect: section.files.map(file => ({
            id: file.fileId,
          })),
        }))),
      },
      attributes: {
        connect: newValueContent.attributes.map(attribute => ({
          id: attribute.valueId,
        })),
      },
    },
  })

  return newExperiment.toDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Creates a new experiment",
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
                    attributeId: { type: "string" },
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
                createdBy: { type: "string", format: "uuid" },
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
                      attributeId: { type: "string" },
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
    },
  },
})
