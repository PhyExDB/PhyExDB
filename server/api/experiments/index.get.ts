export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 10
  const skip = (page - 1) * pageSize

  const onlyPublished = user == null || user.role === "USER"
  const ownExperiments = user?.role === "USER"

  // Cannot use abilities here, since filtering the results of the query would not align with the pagination
  const experiments = await prisma.experiment.findMany({
    skip,
    take: pageSize,
    where: {
      OR: [
        onlyPublished ? { status: "PUBLISHED" } : {},
        ownExperiments ? { userId: user!.id } : {},
        (!onlyPublished && !ownExperiments) ? { duration: { gt: 0 } } : {}, // no filter
      ],
    },
    include: {
      attributes: {
        select: {
          name: true,
          id: true,
          attribute: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  })

  const totalExperiments = await prisma.experiment.count({
    where: {
      OR: [
        onlyPublished ? { status: "PUBLISHED" } : {},
        ownExperiments ? { userId: user!.id } : {},
        (!onlyPublished && !ownExperiments) ? { duration: { gt: 0 } } : {}, // no filter
      ],
    },
  })

  return {
    data: experiments.map(experiment => experiment.toList()),
    pagination: {
      total: totalExperiments,
      page,
      pageSize,
      totalPages: Math.ceil(totalExperiments / pageSize),
    },
  }
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of experiments",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "A list of experiments",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      slug: { type: "string" },
                      userId: { type: "string" },
                      attributes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            id: { type: "string", format: "uuid" },
                            attribute: {
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
                pagination: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})
