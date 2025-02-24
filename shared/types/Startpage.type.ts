import { z } from 'zod'

/**
 * Startpage
 */
export interface Startpage{
    /** Text */
    text: string
    /** Files */
    files: FileDetail[]
}

/**
 * StartpageSchema
 */
export const startpageSchema = z.object({
    text: z.string(),
    files: z.array(z.string().uuid())
})