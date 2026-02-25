import { z } from "zod"

export const reportSchema = z.object({
  message: z.string().min(10, "Die Begründung muss mindestens 10 Zeichen lang sein"),
})
