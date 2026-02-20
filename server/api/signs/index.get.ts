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
