import { readValidatedBody } from "h3"
import { z } from "zod"
import { canCreateExperiment } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const user = await useUser(event)
  await authorize(event, canCreateExperiment)
  if (user == null) {
    throw createError({ statusCode: 401, statusMessage: "No user is logged in" })
  }

  // Validate user data
  const requiredNumSections = await prisma.experimentSection.count()
  const requiredNumAttributes = await prisma.experimentAttribute.count()

  const experimentSchema = z.object({
    name: z.string(),
    duration: z.number(),

    sections: z.array(z.object({
      experimentSectionId: z.string(),
      text: z.string(),
      files: z.array(z.object({
        fileId: z.string(),
      })),
    })).refine((sections) => {
      const sectionIds = sections.map(section => section.experimentSectionId)
      return new Set(sectionIds).size == sectionIds.length
    }, {
      message: "Sections must be unique",
    }).refine((sections) => {
      return sections.length == requiredNumSections
    }, {
      message: "Not enough sections defined",
    }),

    attributes: z.array(z.object({
      valueId: z.string(),
      attributeId: z.string(),
    })).refine((attributes) => {
      const attributeIds = attributes.map(attribute => attribute.attributeId)
      return attributeIds.length == requiredNumAttributes
    }, {
      message: "Not enough attributes specified",
    }),
  })

  const newValueContent = await readValidatedBody(event, body => experimentSchema.parse(body))
  const newExperiment = await prisma.experiment.create({
    data: {
      name: newValueContent.name,
      slug: slugify(newValueContent.name),
      duration: newValueContent.duration,
      userId: user.id,
      sections: {
        create: newValueContent.sections.map(section => ({
          text: section.text,
          experimentSection: { connect: { id: section.experimentSectionId } },
          connect: section.files.map(file => ({
            id: file.fileId,
          })),
        })),
      },
      attributes: {
        connect: newValueContent.attributes.map(attribute => ({
          id: attribute.valueId,
        })),
      },
    },
  })

  return newExperiment
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
                    experimentSectionId: { type: "string" },
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
                      experimentSectionId: { type: "string" },
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
