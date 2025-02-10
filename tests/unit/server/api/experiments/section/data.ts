import { v4 as uuidv4 } from "uuid"
import slugify from "~~/server/utils/slugify"

/**
 * An array of ressource lists
 */
export const lists = [
  "Versuchsziel",
  "Material",
  "Versuchsaufbau",
  "Durchführung",
  "Beobachtung",
  "Ergebnis",
  "Tipps und Tricks",
].map((section, index) => ({
  id: uuidv4(),
  name: section,
  slug: slugify(section),
  order: index,
})) as ExperimentSectionList[]
