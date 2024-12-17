import * as v from "valibot"
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
export const legalDocumentUpdateSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Please enter name")),
  text: v.pipe(v.string(), v.nonEmpty("Please enter text")),
})
