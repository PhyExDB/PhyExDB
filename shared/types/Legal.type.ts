import { z } from "zod"
import type { BaseList } from "./Base.type"

/**
 * Represents a list of legal documents with their names and slugs.
 * Extends the BaseList interface.
 */
export interface LegalDocumentList extends BaseList {
  /**
   * The name of the legal document.
   */
  name: string
  /**
   * The slug (URL-friendly identifier) of the legal document.
   */
  slug: string
}

/**
 * Represents a legal document with its name, slug, and content.
 */
export interface LegalDocumentDetail extends LegalDocumentList {
  /**
   * The content of the legal document.
   */
  text: string
}

/**
 * Schema for validating updates to a legal document.
 */
export const legalDocumentUpdateSchema = z.object({
  name: z.string({ message: "Bitte einen Namen eingeben." }).trim().nonempty("Bitte einen Namen eingeben."),
  text: z.string({ message: "Bitte einen Inhalt eingeben." }).trim().nonempty("Bitte einen Inhalt eingeben."),
}).refine((value) => {
  return value.name !== undefined && value.text !== undefined
}, {
  message: "Name und Inhalt dürfen nicht leer sein.",
})
