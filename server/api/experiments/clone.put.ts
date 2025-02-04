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
  //authorize(event, experimentAbilities.get, experiment)

  async function cloneFile(file: FileDetail) {
    return (await $fetch("/api/files", {
      method: "POST",
      body: {
        files: await $fetch(file.path, {
          method: "GET",
        }),
      },
    }))[0]
  }

  const newExperiment = await untilSlugUnique(
    async (slug: string) => {
      return prisma.experiment.create({
        data: {
          name: experiment.slug,
          slug: slug,
          duration: experiment.duration,
          previewImage: {
            connect: {
              id: experiment.previewImage ? (await cloneFile(experiment.previewImage)).id : undefined,
            },
          },
          user: {
            connect: {
              id: user!.id,
            },
          },
          sections: {
            create: await Promise.all(experiment.sections.map(async section => ({
              text: section.text,
              experimentSection: {
                connect: {
                  id: section.id,
                },
              },
              files: {
                create: await Promise.all(section.files.map(async (file, index) => ({
                  description: file.description,
                  order: index,
                  file: {
                    connect: {
                      id: (await cloneFile(file.file)).id,
                    },
                  },
                }))),
              },
            }))),
          },
          attributes: {
            connect: experiment.attributes
              .flatMap(attribute => attribute.value)
              .filter(valueId => valueId != undefined)
              .map(valueId => ({
                id: valueId,
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
