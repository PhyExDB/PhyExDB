import { z } from "zod"

/**
 * Startpage
 */
export interface Startpage {
  /** Text */
  text: string
  /** Description */
  description: string
  /** Files */
  files: FileDetail[]
}

/**
 * StartpageSchema
 */
export const startpageSchema = z.object({
  text: z.string({ message: "Bitte Text eingeben." })
    .trim()
    .nonempty("Bitte Text eingeben."),
  description: z.string({ message: "Bitte eine Beschreibung eingeben." })
    .trim()
    .nonempty("Bitte eine Beschreibung eingeben."),
  files: z.array(z.string().uuid()),
})
