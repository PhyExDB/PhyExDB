import { auth } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
    //  Auth
    const session = await auth.api.getSession({
        headers: new Headers(event.node.req.headers as HeadersInit),
    })

    if (!session?.user) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    if (session.user.role !== "USER") {
        throw createError({ statusCode: 403, statusMessage: "Not allowed" })
    }

    //  Body
    const body = await readBody(event)

    const { experimentId, message } = body as {
        experimentId?: string
        message?: string
    }

    if (!experimentId) {
        throw createError({ statusCode: 400, statusMessage: "experimentId missing" })
    }

    if (!message?.trim()) {
        throw createError({ statusCode: 400, statusMessage: "message missing" })
    }

    //  Experiment prüfen
    const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId },
        select: { id: true },
    })

    if (!experiment) {
        throw createError({ statusCode: 404, statusMessage: "Experiment not found" })
    }

    //  Report anlegen
    const report = await prisma.report.create({
        data: {
            experimentId: experiment.id,
            userId: session.user.id,
            message: message.trim(),
        },
    })

    return {
        success: true,
        report,
    }
})
