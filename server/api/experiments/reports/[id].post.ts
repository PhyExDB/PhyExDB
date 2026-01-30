import { z } from "zod"
import { auth } from "~~/server/utils/auth"

const reportSchema = z.object({
  message: z.string().min(10, "Die Begründung muss mindestens 10 Zeichen lang sein"),
})

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: new Headers(event.node.req.headers as HeadersInit),
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Nicht authentifiziert" })
  }

  const idOrSlug = getRouterParam(event, "id")

  const experiment = await prisma.experiment.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    select: { id: true },
  })

  if (!experiment) {
    throw createError({
      statusCode: 404,
      statusMessage: "Experiment konnte nicht gefunden werden.",
    })
  }

  const body = await readValidatedBody(event, reportSchema.parse)

  try {
    const newReport = await prisma.report.create({
      data: {
        message: body.message.trim(),
        userId: session.user.id,
        experimentId: experiment.id,
      },
    })

    return {
      success: true,
      reportId: newReport.id,
    }
  } catch (error: any) {
    console.error("Prisma Error:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Fehler beim Speichern des Berichts.",
    })
  }
})
