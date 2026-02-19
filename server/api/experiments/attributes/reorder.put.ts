import { z } from "zod"
import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

const reorderSchema = z.object({
  ids: z.array(z.string()),
})

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.put)

  const { ids } = await readValidatedBody(event, body => reorderSchema.parse(body))

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.experimentAttribute.update({
        where: { id },
        data: { order: index },
      }),
    ),
  )

  return { success: true }
})
