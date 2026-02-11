import { z } from "zod"
import { experimentAttributeValueAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

const reorderSchema = z.object({
  attributeId: z.string(),
  ids: z.array(z.string()),
})

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeValueAbilities.put)

  const body = await readValidatedBody(event, body => reorderSchema.parse(body))
  const { ids } = body

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.experimentAttributeValue.update({
        where: { id },
        data: { order: index },
      }),
    ),
  )

  return { success: true }
})
