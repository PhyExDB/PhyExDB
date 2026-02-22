import {auth} from "~~/server/utils/auth";
console.log("REPORT ENDPOINT HIT")
export default defineEventHandler(async (event) => {

    const session = await auth.api.getSession({
        headers: new Headers(event.node.req.headers as HeadersInit),
    })

    if (!session?.user) {
        throw createError({ statusCode: 401, statusMessage: "Nicht authentifiziert" })
    }

    const experiments = await prisma.experiment.findMany({
        where: { userId: session.user.id },
        select: { id: true }
    });
    const experimentIds = experiments.map(e => e.id);

    const reports = await prisma.report.findMany({
        where: {
            experimentId: { in: experimentIds }
        },
        include: {
            experiment: true
        }
    });

    return reports
})