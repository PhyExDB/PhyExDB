import { v4 as uuidv4 } from "uuid"

/**
 * An array of legalDocument lists
 */
export const lists = [
  {
    id: uuidv4(),
    slug: "privacy-policy",
    name: "Privacy Policy",
  },
  {
    id: uuidv4(),
    slug: "terms-of-service",
    name: "Terms of Service",
  },
  {
    id: uuidv4(),
    slug: "imprint",
    name: "Imprint",
  },
]

/**
 * A legalDocument detail
 */
export const detail = {
  id: uuidv4(),
  slug: "legal-document",
  name: "Legal Document name",
  text: "This is the legal document text",
}
