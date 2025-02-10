import { getSlugOrIdPrismaWhereClause, untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"

export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: experimentIncludeForToDetail,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  }

  const user = await authorizeUser(event, fileAbilities.post)
  authorize(event, experimentAbilities.get, experiment)

  const newExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.create({
        data: {
          name: experiment.name,
          slug: slug,
          duration: experiment.duration,
          previewImage: experiment.previewImageId
            ? {
                connect: {
                  id: experiment.previewImageId,
                },
              }
            : undefined,
          user: {
            connect: {
              id: user!.id,
            },
          },
          sections: {
            create: experiment.sections.map(section => ({
              text: section.text,
              experimentSection: {
                connect: {
                  id: section.experimentSection.id,
                },
              },
              files: {
                create: section.files.map((file, index) => ({
                  description: file.description,
                  order: index,
                  file: {
                    connect: {
                      id: file.file.id,
                    },
                  },
                })),
              },
            })),
          },
          attributes: {
            connect: experiment.attributes
              .filter(attribute => attribute.id != undefined)
              .map(attribute => ({
                id: attribute.id,
              })),
          },
        },
        include: experimentIncludeForToDetail,
      })
    },
    slugify(experiment.slug),
  )

  setResponseStatus(event, 201)
  return mapExperimentToDetail(newExperiment as ExperimentIncorrectDetail)
})

defineRouteMeta({
  openAPI: {
    description: "Clones an experiment",
    tags: ["Experiment"],
    responses: {
      201: {
        description: "Experiment cloned successfully",
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
