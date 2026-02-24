export default defineEventHandler(async (event) => {
    const body = await readBody<{ reportIds: string[] }>(event)
    const session = await auth.api.getSession({
        headers: new Headers(event.node.req.headers as HeadersInit),
    })

    if (!session?.user) throw createError({ statusCode: 401 })

    await prisma.report.updateMany({
        where: {
            id: { in: body.reportIds },
            experiment: { userId: session.user.id }
        },
        data: { seenByOwner: true }
    })

    return { success: true }
})