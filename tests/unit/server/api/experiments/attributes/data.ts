import { v4 as uuidv4 } from "uuid"
import slugify from "~~/server/utils/slugify"

/**
 * An array of ressource lists
 */
export const lists = [
  {
    name: "Themenbereich",
    multipleSelection: false,
    values: [
      "Optik",
      "Wärmelehre",
      "Magnetismus",
      "Elektrizität",
      "Mechanik",
      "Akustik",
      "Radioaktivität",
      "Atomphysik",
      "Quantenphysik",
    ],
  },
  {
    name: "Versuchsart",
    multipleSelection: false,
    values: ["Freihand", "Qualitativ", "Quantitativ", "Simulation"],
  },
  {
    name: "Einsatz",
    multipleSelection: true,
    values: ["Phänomene", "Gesetzmäßigkeiten", "Weiterführung"],
  },
  {
    name: "Arbeitsform",
    multipleSelection: true,
    values: ["Demoversuch", "SUS-Versuch", "Heimversuch"],
  },
  {
    name: "Messwert\u00ADerfassung",
    multipleSelection: true,
    values: ["Analog", "Digital", "Beobachtung"],
  },
  {
    name: "Vorbereitungs\u00ADzeit",
    multipleSelection: false,
    values: ["unter 1 Stunde", "ca. 1 Stunde", "mehrere Stunden", "mehrere Tage"],
  },
].map((attribute, index) => {
  return {
    ...attribute,
    order: index,
    id: uuidv4(),
    slug: slugify(attribute.name),
    values: attribute.values.map((value) => {
      return {
        id: uuidv4(),
        value: value,
        slug: slugify(value),
      }
    }),
  }
}) satisfies ExperimentAttributeDetail[]

/**
 * A resource detail
 */
export const detail = lists[0]! satisfies ExperimentAttributeDetail
