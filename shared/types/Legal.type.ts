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
export interface LegalDocumentDetail extends LegalList {
  /**
   * The content of the legal document.
   */
  content: string
}

/**
 * Represents an update to a legal document.
 */
export interface LegalDocumentUpdate {
  /**
   * The name of the legal document.
   */
  name: string
  /**
   * The content of the legal document.
   */
  content: string
}
