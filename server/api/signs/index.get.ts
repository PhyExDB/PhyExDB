/**
 * Retrieves all available signs from the database, transforms their icon paths,
 * and returns them sorted by type (WARNING first, then SAFETY) and alphabetically
 * by icon path within each type.
 *
 * @returns A sorted array of {@link Sign} objects with resolved icon paths.
 */
export default defineEventHandler(async () => {
  const signs = await prisma.sign.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      iconPath: true,
    },
  })

  // Sort by type first (WARNING first, SAFETY second), then alphabetically by filename
  const typeOrder = { WARNING: 0, SAFETY: 1 }

  const sortedSigns = signs
    .map(sign => ({
      ...sign,
      iconPath: `/${sign.type.toLowerCase()}/${sign.iconPath}`,
    }))
    .sort((a, b) => {
      const typeDiff = typeOrder[a.type] - typeOrder[b.type]
      if (typeDiff !== 0) return typeDiff
      return a.iconPath.localeCompare(b.iconPath)
    })

  return sortedSigns
})

defineRouteMeta({
  openAPI: {
    description: "Returns all available signs, sorted by type (WARNING first, then SAFETY) and alphabetically by icon path within each type.",
    tags: ["Sign"],
    responses: {
      200: {
        description: "A sorted list of signs",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "name", "type", "iconPath"],
                properties: {
                  id: {
                    type: "string",
                    description: "Unique identifier for the sign",
                  },
                  name: {
                    type: "string",
                    description: "Display name of the sign",
                  },
                  type: {
                    type: "string",
                    enum: ["WARNING", "SAFETY"],
                    description: "The category of the sign",
                  },
                  iconPath: {
                    type: "string",
                    description:
                      "Public path to the sign icon, prefixed with its type directory",
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
