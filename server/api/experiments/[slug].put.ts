import { readValidatedBody } from "h3"
import { validate as uuidValidate } from "uuid"
import { getExperimentUpdateSchema } from "~~/shared/types"

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
  await authorize(event, canEditExperiment, experiment.toList())

  const updatedExperimentData = await readValidatedBody(event, async body => (await getExperimentUpdateSchema()).parse(body))

  const updatedExperiment = await prisma.experiment.update({
    where: { id: updatedExperimentData.id },
    data: {
      name: updatedExperimentData.name,
      slug: slugify(updatedExperimentData.name),
      duration: updatedExperimentData.duration,
      sections: {
        updateMany: {
          where: {
            experimentId: updatedExperimentData.id,
          },
          data: updatedExperimentData.sections.map(section => ({
            where: {
              order: section.experimentSectionPositionInOrder,
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
        },
      },
      attributes: {
        set: [],
        connect: updatedExperimentData.attributes.map(attribute => ({
          id: attribute.valueId,
        })),
      },
    },
  })

  return updatedExperiment.toDetail()
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
              title: { type: "string" },
              experimentStatus: { type: "string", enum: ["Draft", "Submitted", "Accepted"] },
              duration: { type: "number" },
            },
            required: ["username", "email"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Experiment updated sucessfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                createdBy: { type: "string", format: "uuid" },
                title: { type: "string" },
                experimentStatus: { type: "string", enum: ["Draft", "Submitted", "Accepted"] },
                duration: { type: "number" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid user data",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
