import { z } from "zod"

export const experimentReportSchema = z.object({
    message: z.string().min(5).max(2000),
})
// Nachricht mit mindestens 5 Zeichen